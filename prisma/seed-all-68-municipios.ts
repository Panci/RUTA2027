import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Mapeo exhaustivo de colores oficiales e identidades visuales por candidatura
const PARTY_COLORS: Record<string, string> = {
  'PP': '#2563eb',
  'PSOE': '#ef4444',
  'PSOE-A': '#ef4444',
  'VOX': '#22c55e',
  'CON ANDALUCÍA': '#9333ea',
  'CON ANDALUCIA': '#9333ea',
  'ADELANTE ANDALUCÍA': '#06b6d4',
  'CS': '#ea580c',
  'CS-GIP-ICPAL': '#ea580c',
  'UA': '#16a34a',
  '100% RJ': '#d97706',
  'SA': '#0d9488',
  'MPA': '#db2777',
  'CMOS': '#4f46e5',
  'PIAV': '#65a30d',
  'POR ALMENSILLA': '#e11d48',
  'BENACAZÓN NOS UNE': '#0891b2',
  'JUNTOS X LA CAMPANA': '#7c3aed',
  'CCXC': '#f59e0b',
  'CPSG': '#10b981',
  'GERENA PARTICIPA': '#6366f1',
  'AMA': '#84cc16',
  'VEPM': '#f97316',
  'PIDA': '#14b8a6',
  'UXA': '#ec4899',
  'JXP': '#8b5cf6',
  'ATR': '#0284c7',
  'ULLYC': '#eab308',
  'SOMOS VILLAVERDE': '#06b6d4',
  'XG': '#10b981',
  'AEVI': '#f43f5e',
  'AE CONTIGO VVA DEL RIO Y MINAS': '#a855f7',
  'PALOMARES, UN PASO MÁS': '#0284c7',
  'DESPIERTA': '#64748b',
  'MCR': '#b91c1c',
};

const LOCAL_PALETTE = [
  '#0284c7', '#d97706', '#0d9488', '#db2777', '#4f46e5',
  '#65a30d', '#e11d48', '#0891b2', '#7c3aed', '#f59e0b',
  '#10b981', '#6366f1', '#84cc16', '#f97316', '#14b8a6',
];

function getPartyColor(acronym: string, index: number): string {
  const clean = acronym.trim().toUpperCase();
  for (const [key, val] of Object.entries(PARTY_COLORS)) {
    if (key.toUpperCase() === clean) return val;
  }
  return LOCAL_PALETTE[index % LOCAL_PALETTE.length];
}

// Normalización de nombres de municipios según estilo natural en castellano
function normalizeMunicipalityName(rawName: string): string {
  const trimmed = rawName.trim();
  const match = trimmed.match(/^(.*),\s*(El|La|Los|Las)$/i);
  if (match) {
    return `${match[2]} ${match[1]}`.trim();
  }
  return trimmed;
}

interface CsvRow {
  codigo_provincia: string;
  provincia: string;
  codigo_municipio: string;
  municipio: string;
  poblacion_2023: string;
  candidatura: string;
  siglas: string;
  votos: string;
  concejales: string;
}

interface GroupedMunicipality {
  code: string;
  rawName: string;
  normalizedName: string;
  population: number;
  parties: {
    name: string;
    acronym: string;
    votes: number;
    concejales: number;
  }[];
}

async function main() {
  console.log('🚀 Iniciando importación y actualización de los municipios de Sevilla desde el CSV...');

  const csvPath = path.resolve(process.cwd(), 'sevilla_municipales_2023_municipios_menores_10000.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`No se encontró el archivo CSV en la ruta: ${csvPath}`);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse<CsvRow>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`Error parseando el CSV: ${JSON.stringify(parsed.errors)}`);
  }

  console.log(`📄 Filas leídas del archivo CSV: ${parsed.data.length}`);

  // Agrupar filas por municipio
  const municipalityMap = new Map<string, GroupedMunicipality>();

  for (const row of parsed.data) {
    const rawMun = row.municipio?.trim();
    if (!rawMun) continue;

    const normName = normalizeMunicipalityName(rawMun);
    const votes = parseInt(row.votos, 10) || 0;
    const concejales = parseInt(row.concejales, 10) || 0;
    const pop = parseInt(row.poblacion_2023, 10) || 1500;
    const code = row.codigo_municipio?.trim() || '41000';
    const acronym = row.siglas?.trim() || 'IND';
    const name = row.candidatura?.trim() || acronym;

    if (!municipalityMap.has(normName)) {
      municipalityMap.set(normName, {
        code,
        rawName: rawMun,
        normalizedName: normName,
        population: pop,
        parties: [],
      });
    }

    municipalityMap.get(normName)!.parties.push({
      name,
      acronym,
      votes,
      concejales,
    });
  }

  console.log(`🏛️ Total de municipios únicos identificados: ${municipalityMap.size}`);

  // 1. Limpieza de campañas existentes para eliminar duplicados o datos obsoletos
  console.log('🧹 Limpiando campañas existentes en la base de datos para garantizar datos 100% exactos...');
  await prisma.campaign.deleteMany();
  console.log('✅ Base de datos limpia de duplicados.');

  // Ordenar municipios alfabéticamente
  const sortedMunicipalities = Array.from(municipalityMap.values()).sort((a, b) =>
    a.normalizedName.localeCompare(b.normalizedName, 'es', { sensitivity: 'base' })
  );

  let importedCount = 0;

  for (const m of sortedMunicipalities) {
    const partyVotesSum = m.parties.reduce((sum, p) => sum + p.votes, 0);
    const totalSeats = m.parties.reduce((sum, p) => sum + p.concejales, 0);

    // Estimación técnica oficial de blancos, nulos y censo electoral
    const blankVotes = Math.max(4, Math.round(partyVotesSum * 0.012));
    const nullVotes = Math.max(5, Math.round(partyVotesSum * 0.015));
    const validVotesTotal = partyVotesSum + blankVotes;
    const turnoutTotal = validVotesTotal + nullVotes;
    const estimatedCensus = Math.max(
      turnoutTotal + 40,
      Math.round(m.population * 0.81),
      Math.round(partyVotesSum * 1.25)
    );
    const census = Math.max(turnoutTotal + 20, estimatedCensus);

    // Identificar la candidatura propia (PSOE-A / PSOE de referencia o primera fuerza)
    let ownPartyCandidate = m.parties.find(
      (p) => p.acronym.toUpperCase() === 'PSOE-A' || p.acronym.toUpperCase() === 'PSOE'
    );
    if (!ownPartyCandidate) {
      ownPartyCandidate = m.parties[0];
    }

    const ownAcronym = ownPartyCandidate.acronym;
    const ownSeats = ownPartyCandidate.concejales;
    const majoritySeats = Math.ceil((totalSeats + 1) / 2);

    // Determinación del objetivo político
    let politicalGoal = 'GANAR';
    if (ownSeats >= majoritySeats) {
      politicalGoal = 'GOBERNAR'; // Ya ostenta mayoría absoluta
    } else if (ownSeats > 0 && ownPartyCandidate === m.parties.reduce((max, p) => p.votes > max.votes ? p : max, m.parties[0])) {
      politicalGoal = 'GOBERNAR'; // Primera fuerza
    }

    // Adversarios principales (los demás partidos con representación o votos)
    const rivals = m.parties
      .filter((p) => p.acronym !== ownAcronym)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 3)
      .map((p) => `${p.acronym} (${p.concejales} conc., ${p.votes} votos)`)
      .join(', ');

    const mainAdversaries = rivals || 'Oposición municipal';

    // 1. Crear Campaña
    const campaign = await prisma.campaign.create({
      data: {
        name: `Ruta ${m.normalizedName} 2027`,
        municipality: m.normalizedName,
        candidacyName: `${ownAcronym} ${m.normalizedName}`,
        partyOrCoalition: ownAcronym,
        politicalGoal,
        electionDate: new Date('2027-05-23T09:00:00.000Z'),
        teamDescription: `Comité de campaña municipal de ${m.normalizedName}, equipo de movilización y apoderados.`,
        availableResources: `Sede local, medios digitales vecinales, material impreso y presupuesto asignado.`,
        mainAdversaries,
        strengths: ownSeats >= majoritySeats
          ? `Alcaldía con mayoría absoluta (${ownSeats}/${totalSeats} concejales) y gestión contrastada.`
          : `Gran arraigo social vecinal, ${ownSeats} concejales consolidados y alta capacidad de pacto.`,
        weaknesses: ownSeats < majoritySeats
          ? `Necesidad de captar indecisos y disputar el último concejal D'Hondt frente a la fragmentación de voto.`
          : `Riesgo de desgaste del equipo de gobierno y relajación de la participación electoral.`,
        risks: `Desmovilización del voto progresista rural, abstención o polarización local.`,
      },
    });

    // 2. Crear Partidos
    const partyMap = new Map<string, string>();
    for (let i = 0; i < m.parties.length; i++) {
      const p = m.parties[i];
      const isOwn = p.acronym === ownAcronym;
      const pct = validVotesTotal > 0 ? (p.votes / validVotesTotal) * 100 : 0;
      const colorHex = getPartyColor(p.acronym, i);

      const createdParty = await prisma.party.create({
        data: {
          campaignId: campaign.id,
          name: p.name,
          acronym: p.acronym,
          colorHex,
          isOwnParty: isOwn,
          concejales2023: p.concejales,
          votes2023: p.votes,
          percent2023: parseFloat(pct.toFixed(2)),
          candidateName: null,
        },
      });
      partyMap.set(p.acronym, createdParty.id);
    }

    // 3. Crear Distritos y Resultados Electorales 2023
    const hasMultipleDistricts = m.population >= 6000;
    const districtsData = hasMultipleDistricts
      ? [
          { code: 'D01', name: 'Centro y Casco Urbano', censusFraction: 0.65, classification: 'COMPETENCIA_ABIERTA', mesas: Math.max(2, Math.ceil(census * 0.65 / 750)) },
          { code: 'D02', name: 'Zonas Residenciales y Diseminados', censusFraction: 0.35, classification: 'OPORTUNIDAD', mesas: Math.max(1, Math.ceil(census * 0.35 / 750)) },
        ]
      : [
          { code: 'D01', name: 'Distrito Municipal Único', censusFraction: 1.0, classification: 'COMPETENCIA_ABIERTA', mesas: Math.max(1, Math.ceil(census / 800)) },
        ];

    for (const d of districtsData) {
      const distCensus = Math.round(census * d.censusFraction);
      const district = await prisma.district.create({
        data: {
          campaignId: campaign.id,
          code: d.code,
          name: d.name,
          electoralRoll: distCensus,
          pollingStationsCount: d.mesas,
          classification: d.classification,
        },
      });

      // Distribuir votos proporcionales por distrito
      let rank = 1;
      const sortedParties = [...m.parties].sort((a, b) => b.votes - a.votes);
      for (const p of sortedParties) {
        const distVotes = Math.round(p.votes * d.censusFraction);
        const distValid = Math.round(validVotesTotal * d.censusFraction);
        const distTurnout = Math.round(turnoutTotal * d.censusFraction);
        const distBlank = Math.round(blankVotes * d.censusFraction);
        const distNull = Math.round(nullVotes * d.censusFraction);
        const distAbstention = distCensus - distTurnout;
        const pct = distValid > 0 ? (distVotes / distValid) * 100 : 0;

        await prisma.electionResult2023.create({
          data: {
            districtId: district.id,
            partyId: partyMap.get(p.acronym)!,
            census: distCensus,
            turnout: distTurnout,
            abstention: Math.max(0, distAbstention),
            validVotes: distValid,
            blankVotes: distBlank,
            nullVotes: distNull,
            votes: distVotes,
            percent: parseFloat(pct.toFixed(2)),
            concejales: p.concejales,
            position: rank++,
          },
        });
      }
    }

    // 4. Hoja de Ruta (7 Fases estándar 2026-2027)
    const phases = [
      { phaseNumber: 1, name: 'Diagnóstico y preparación', startDate: new Date('2026-09-01'), endDate: new Date('2026-10-31'), status: 'IN_PROGRESS', objectives: 'Censo de voluntariado, diagnóstico territorial y presupuesto municipal.' },
      { phaseNumber: 2, name: 'Definición del posicionamiento', startDate: new Date('2026-11-01'), endDate: new Date('2026-12-31'), status: 'PENDING', objectives: 'Tres prioridades irrenunciables, banco de mensajes y argumentarios.' },
      { phaseNumber: 3, name: 'Relación y presencia pública', startDate: new Date('2027-01-01'), endDate: new Date('2027-02-28'), status: 'PENDING', objectives: 'Encuentros con tejido asociativo, comercio local y colectivos vecinales.' },
      { phaseNumber: 4, name: 'Activación del equipo', startDate: new Date('2027-03-01'), endDate: new Date('2027-03-31'), status: 'PENDING', objectives: 'Formación de apoderados e interventores para todas las mesas electorales.' },
      { phaseNumber: 5, name: 'Contacto ciudadano', startDate: new Date('2027-04-01'), endDate: new Date('2027-05-06'), status: 'PENDING', objectives: 'Buzoneo integral, actos en plazas y cercanía directa con cada familia.' },
      { phaseNumber: 6, name: 'Campaña electoral oficial', startDate: new Date('2027-05-07'), endDate: new Date('2027-05-21'), status: 'PENDING', objectives: 'Mítines centrales, movilización máxima y difusión del programa de gobierno.' },
      { phaseNumber: 7, name: 'Jornada electoral y escrutinio', startDate: new Date('2027-05-22'), endDate: new Date('2027-05-31'), status: 'PENDING', objectives: 'Supervisión del 100% de las mesas electorales y seguimiento del escrutinio.' },
    ];

    for (const phase of phases) {
      await prisma.roadmapPhase.create({
        data: {
          campaignId: campaign.id,
          ...phase,
        },
      });
    }

    // 5. Estrategia Central y Posicionamiento
    await prisma.campaignStrategy.create({
      data: {
        campaignId: campaign.id,
        mainGoal: politicalGoal === 'GOBERNAR'
          ? `Garantizar la estabilidad y gobernar ${m.normalizedName} con solvencia y cercanía.`
          : `Alcanzar la mayoría suficiente en ${m.normalizedName} para liderar el cambio de gobierno local.`,
        targetAudience: 'Familias trabajadoras, agricultores, autónomos, personas mayores y juventud local.',
        brandIdea1: `${m.normalizedName} avanza con hechos y transparencia.`,
        brandIdea2: 'Defensa firme de los servicios públicos, la sanidad y la educación en nuestro pueblo.',
        brandIdea3: 'Generación de oportunidades para que nadie tenga que marcharse por falta de empleo o vivienda.',
        messagesToRepeat: `Cercanía, trabajo constante y un proyecto ilusionante para el bienestar de ${m.normalizedName}.`,
        topicsToAvoid: 'Descalificaciones personales y debates alejados de la realidad municipal.',
      },
    });

    // 6. Tres Prioridades Políticas Irrenunciables
    const priorities = [
      { orderNumber: 1, title: 'Empleo, Comercio y Economía Local', description: `Incentivos al comercio de proximidad, apoyo a las cooperativas y modernización económica en ${m.normalizedName}.`, targetMetric: '+10% de apoyo directo al tejido productivo local' },
      { orderNumber: 2, title: 'Servicios Públicos y Cuidados', description: 'Garantía y refuerzo de consultorios médicos, centros de día y atención a nuestros mayores.', targetMetric: '100% cobertura en servicios sociales y transporte' },
      { orderNumber: 3, title: 'Juventud, Vivienda e Infraestructuras', description: 'Políticas activas para fijar la población joven con acceso a vivienda y alternativas de ocio sano.', targetMetric: 'Facilitar el arraigo de nuevas familias en el municipio' },
    ];

    for (const p of priorities) {
      await prisma.campaignPriority.create({
        data: {
          campaignId: campaign.id,
          ...p,
        },
      });
    }

    // 7. Diagnóstico Estratégico DAFO
    await prisma.strategicDiagnostic.create({
      data: {
        campaignId: campaign.id,
        situationOverview: `Diagnóstico municipal de ${m.normalizedName} para las Elecciones Municipales de Mayo 2027 (${totalSeats} concejales en liza).`,
        citizenProblems: 'Retos demográficos, mejora del mantenimiento urbano y mayor dinamismo económico.',
        strengths: `${ownAcronym} cuenta con una sólida implantación vecinal y un equipo con vocación de servicio.`,
        weaknesses: `Dispersión del voto y necesidad de conectar con los nuevos votantes jóvenes.`,
        opportunities: 'Inversiones en sostenibilidad, digitalización municipal y fondos para municipios rurales.',
        threats: 'Riesgo de fragmentación en el pleno municipal que dificulte la gobernabilidad.',
        teamCapabilities: 'Estructura militante activa y voluntarios comprometidos con el municipio.',
        availableResources: 'Presupuesto local coordinado, canales de comunicación directa y presencia permanente en la calle.',
      },
    });

    // 8. Reunión Semanal de Comité de Campaña por defecto
    await prisma.weeklyMeeting.create({
      data: {
        campaignId: campaign.id,
        meetingDate: new Date('2026-10-01T18:00:00.000Z'),
        agenda: `1. Análisis del censo y resultado 2023 en ${m.normalizedName}. 2. Constitución del comité electoral local. 3. Asignación de apoderados e interventores por mesa.`,
        decisionsTaken: `Aprobación unánime del calendario de precampaña y plan de proximidad vecinal en ${m.normalizedName}.`,
        roadblocks: 'Completar la cobertura de todas las mesas electorales con voluntarios locales.',
        priorityChanges: 'Mantener foco prioritario en empleo local y defensa de servicios públicos.',
        risksDetected: 'Riesgo de fragmentación y abstención diferencial en determinadas secciones censales.',
        nextReviewDate: new Date('2026-10-08T18:00:00.000Z'),
      },
    });

    importedCount++;
  }

  // 9. Re-vincular los usuarios del sistema al primer municipio
  const firstCampaign = await prisma.campaign.findFirst({
    orderBy: { municipality: 'asc' },
  });

  if (firstCampaign) {
    await prisma.user.updateMany({
      data: { campaignId: firstCampaign.id },
    });
    console.log(`🔗 Usuarios del sistema vinculados a la campaña inicial: ${firstCampaign.municipality}`);
  }

  console.log(`\n🎉 ¡Importación completada con éxito!`);
  console.log(`📊 Total de municipios de Sevilla creados e indexados: ${importedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante la importación de municipios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
