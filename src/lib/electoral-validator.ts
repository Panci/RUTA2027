/**
 * Validador de Datos Electorales para Importaciones CSV / Excel
 */

export interface ElectoralRowRecord {
  distritoCodigo: string;
  distritoNombre?: string;
  partidoSiglas: string;
  partidoNombre?: string;
  censo?: number;
  participacion?: number;
  abstencion?: number;
  votosValidos?: number;
  votosBlancos?: number;
  votosNulos?: number;
  votosCandidatura: number;
  concejales?: number;
}

export interface ValidationError {
  line: number;
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface ValidationSummary {
  isValid: boolean;
  totalRowsProcessed: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  detectedDistricts: string[];
  detectedParties: string[];
}

export function validateElectoralRecords(records: ElectoralRowRecord[]): ValidationSummary {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const districtsSet = new Set<string>();
  const partiesSet = new Set<string>();

  records.forEach((row, index) => {
    const line = index + 1;

    // Validación obligatoria de campos mínimos
    if (!row.distritoCodigo || row.distritoCodigo.trim() === '') {
      errors.push({
        line,
        field: 'distritoCodigo',
        message: 'El código o identificador de distrito es obligatorio.',
        severity: 'error',
      });
    } else {
      districtsSet.add(row.distritoCodigo.trim());
    }

    if (!row.partidoSiglas || row.partidoSiglas.trim() === '') {
      errors.push({
        line,
        field: 'partidoSiglas',
        message: 'Las siglas o nombre de la candidatura son obligatorios.',
        severity: 'error',
      });
    } else {
      partiesSet.add(row.partidoSiglas.trim().toUpperCase());
    }

    if (row.votosCandidatura === undefined || isNaN(row.votosCandidatura) || row.votosCandidatura < 0) {
      errors.push({
        line,
        field: 'votosCandidatura',
        message: 'Los votos de la candidatura deben ser un número entero mayor o igual a 0.',
        severity: 'error',
      });
    }

    // Comprobaciones de coherencia electoral si los datos agregados están presentes
    if (row.censo !== undefined && row.participacion !== undefined) {
      if (row.participacion > row.censo) {
        warnings.push({
          line,
          field: 'participacion',
          message: `La participación (${row.participacion}) supera el censo registrado (${row.censo}).`,
          severity: 'warning',
        });
      }
    }

    if (row.votosCandidatura !== undefined && row.censo !== undefined && row.censo > 0) {
      if (row.votosCandidatura > row.censo) {
        errors.push({
          line,
          field: 'votosCandidatura',
          message: `Los votos de la candidatura (${row.votosCandidatura}) superan el censo total del distrito (${row.censo}).`,
          severity: 'error',
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    totalRowsProcessed: records.length,
    errors,
    warnings,
    detectedDistricts: Array.from(districtsSet),
    detectedParties: Array.from(partiesSet),
  };
}
