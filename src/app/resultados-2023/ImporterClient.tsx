'use client';

import React, { useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImporterProps {
  onImportSuccess?: () => void;
}

export default function ImporterClient({ onImportSuccess }: ImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setValidationErrors([]);
    setSuccessMessage(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          validateAndSetData(data);
        } catch (err: any) {
          setValidationErrors(['Error al leer el archivo Excel: ' + err.message]);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          validateAndSetData(results.data);
        },
        error: (err) => {
          setValidationErrors(['Error al parsear el archivo CSV: ' + err.message]);
        },
      });
    }
  };

  const validateAndSetData = (data: any[]) => {
    const errors: string[] = [];
    if (!data || data.length === 0) {
      errors.push('El archivo no contiene filas o datos legibles.');
      setValidationErrors(errors);
      return;
    }

    // Normalizar nombres de columnas comunes
    const cleaned = data.map((row: any, idx: number) => {
      const line = idx + 1;
      const distrito = row.Distrito || row.distrito || row.DISTRITO || row.Codigo || row.codigo;
      const partido = row.Partido || row.partido || row.Siglas || row.siglas || row.PARTIDO;
      const votos = parseInt(row.Votos || row.votos || row.VOTOS || '0', 10);

      if (!distrito) {
        errors.push(`Fila ${line}: Falta la columna 'Distrito'`);
      }
      if (!partido) {
        errors.push(`Fila ${line}: Falta la columna 'Partido' o 'Siglas'`);
      }

      return {
        distrito: distrito ? String(distrito).trim() : '',
        partido: partido ? String(partido).trim() : '',
        votos: isNaN(votos) ? 0 : votos,
        censo: parseInt(row.Censo || row.censo || '0', 10) || 0,
        participacion: parseInt(row.Participacion || row.participacion || '0', 10) || 0,
        porcentaje: parseFloat(row.Porcentaje || row.porcentaje || '0') || 0,
      };
    });

    setValidationErrors(errors.slice(0, 5)); // Mostrar max 5 errores
    setFileData(cleaned);
  };

  const handleApplyImport = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/electoral-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: fileData }),
      });

      if (res.ok) {
        setSuccessMessage(`Se han importado y validado ${fileData.length} registros electorales con éxito.`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        const data = await res.json();
        setValidationErrors([data.error || 'Error al guardar los datos en la base de datos']);
      }
    } catch (err: any) {
      setValidationErrors(['Error en la conexión con el servidor: ' + err.message]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-red-600" />
            Importador de Resultados Electorales 2023
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Carga de línea base histórica en formato CSV o Excel (.xlsx) para contraste territorial.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          {isOpen ? 'Cerrar Importador' : 'Importar Archivo CSV / Excel'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-red-500 transition rounded-xl p-6 text-center bg-slate-50/50">
            <input
              type="file"
              id="electoral-file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="electoral-file" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Haz clic para seleccionar o arrastra aquí tu archivo CSV o Excel
              </span>
              <span className="text-[11px] text-slate-400">
                Columnas requeridas: Distrito, Partido (o Siglas), Votos, Censo (opcional)
              </span>
            </label>
          </div>

          {fileName && (
            <div className="p-3 bg-slate-100 rounded-lg text-xs flex items-center justify-between">
              <span className="font-medium text-slate-700">Archivo: {fileName} ({fileData.length} filas detectadas)</span>
              {validationErrors.length === 0 && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Validación superada
                </span>
              )}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Discrepancias detectadas:
              </span>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {fileData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Vista previa de datos a importar (primeras 5 filas):</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="p-2">Distrito</th>
                      <th className="p-2">Partido</th>
                      <th className="p-2">Votos</th>
                      <th className="p-2">Censo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fileData.slice(0, 5).map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{r.distrito}</td>
                        <td className="p-2">{r.partido}</td>
                        <td className="p-2 font-bold text-slate-800">{r.votos.toLocaleString()}</td>
                        <td className="p-2 text-slate-500">{r.censo.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setFileData([]); setFileName(''); }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={isProcessing || validationErrors.length > 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Confirmar e Importar Resultados
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
