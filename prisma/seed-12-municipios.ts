import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MunicipalityData {
  municipality: string;
  totalSeats: number;
  census: number;
  blankVotes: number;
  nullVotes: number;
  politicalGoal: string;
  strengths: string;
  weaknesses: string;
  risks: string;
  mainAdversaries: string;
  parties: {
    acronym: string;
    name: string;
    colorHex: string;
    isOwnParty: boolean;
    votes: number;
    concejales: number;
    candidateName?: string;
  }[];
  districts: {
    code: string;
    name: string;
    censusFraction: number; // porcentaje del censo
    classification: string;
    mesas: number;
  }[];
}

const municipalities: MunicipalityData[] = [
  {
    municipality: 'Alanís',
    totalSeats: 9,
    census: 1420,
    blankVotes: 12,
    nullVotes: 15,
    politicalGoal: 'GANAR',
    strengths: 'Fuerte implantación histórica y candidatura renovada con arraigo vecinal.',
    weaknesses: 'Diferencia de 68 votos frente al PP en 2023 que requiere movilizar abstención.',
    risks: 'Desmovilización del electorado progresista rural por despoblación.',
    mainAdversaries: 'PP (actual alcaldía con mayoría de 5 concejales) y VOX.',
    parties: [
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 485, concejales: 5 },
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 417, concejales: 4 },
      { acronym: 'VOX', name: 'VOX', colorHex: '#22c55e', isOwnParty: false, votes: 16, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Urbano y Entorno', censusFraction: 1.0, classification: 'COMPETENCIA_ABIERTA', mesas: 2 },
    ],
  },
  {
    municipality: 'Almadén de la Plata',
    totalSeats: 9,
    census: 1220,
    blankVotes: 10,
    nullVotes: 14,
    politicalGoal: 'GOBERNAR',
    strengths: 'Primera fuerza en votos (437 votos, 4 concejales) y capacidad de pacto.',
    weaknesses: 'Escenario fragmentado con Ciudadanos ostentando la llave de gobierno.',
    risks: 'Pacto de derechas PP + Cs que impida gobernar a la lista más votada.',
    mainAdversaries: 'PP (4 concejales), CS-MUNICIPALES (1 concejal) y VOX.',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 437, concejales: 4 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 361, concejales: 4 },
      { acronym: 'CS-MUNICIPALES', name: 'Ciudadanos - Cs Municipales', colorHex: '#ea580c', isOwnParty: false, votes: 183, concejales: 1 },
      { acronym: 'VOX', name: 'VOX', colorHex: '#22c55e', isOwnParty: false, votes: 11, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Distrito Municipal Almadén', censusFraction: 1.0, classification: 'CRECIMIENTO', mesas: 2 },
    ],
  },
  {
    municipality: 'Cazalla de la Sierra',
    totalSeats: 11,
    census: 3850,
    blankVotes: 28,
    nullVotes: 36,
    politicalGoal: 'DEFENSA',
    strengths: 'Mayoría absoluta sólida (7 concejales de 11) y liderazgo comarcal incuestionable.',
    weaknesses: 'Desgaste de gestión tras años de gobierno municipal.',
    risks: 'Desmovilización de la base militante al darse por descontada la victoria.',
    mainAdversaries: 'PP (3 concejales), Con Andalucía (1 concejal) y VOX.',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 1447, concejales: 7 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 684, concejales: 3 },
      { acronym: 'CON ANDALUCIA', name: 'Con Andalucía (IU-Podemos)', colorHex: '#9333ea', isOwnParty: false, votes: 262, concejales: 1 },
      { acronym: 'VOX', name: 'VOX', colorHex: '#22c55e', isOwnParty: false, votes: 118, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Distrito 1 - Casco Histórico y Centro', censusFraction: 0.52, classification: 'FORTALEZA', mesas: 3 },
      { code: 'D02', name: 'Distrito 2 - Ensanche y Estación', censusFraction: 0.48, classification: 'DEFENSA', mesas: 2 },
    ],
  },
  {
    municipality: 'Constantina',
    totalSeats: 13,
    census: 4800,
    blankVotes: 42,
    nullVotes: 51,
    politicalGoal: 'GANAR',
    strengths: 'Gran base electoral (1.446 votos, 6 concejales) y cercanía a la mayoría.',
    weaknesses: 'Gobierno del PP con 7 concejales con control del aparato municipal.',
    risks: 'Polarización extrema que dificulte captar votantes moderados del centro.',
    mainAdversaries: 'PP (gobierno con mayoría absoluta ajustada, 7 concejales).',
    parties: [
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 1831, concejales: 7 },
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 1446, concejales: 6 },
    ],
    districts: [
      { code: 'D01', name: 'Distrito 1 - Centro y La Morería', censusFraction: 0.53, classification: 'OPORTUNIDAD', mesas: 3 },
      { code: 'D02', name: 'Distrito 2 - Barrios Nuevos y Afueras', censusFraction: 0.47, classification: 'CRECIMIENTO', mesas: 3 },
    ],
  },
  {
    municipality: 'El Castillo de las Guardas',
    totalSeats: 9,
    census: 1250,
    blankVotes: 14,
    nullVotes: 18,
    politicalGoal: 'DEFENSA',
    strengths: 'Mayoría absoluta contundente (6 de 9 concejales, 58.5% del voto válido).',
    weaknesses: 'Dispersión territorial en numerosas pedanías que exige constante presencia.',
    risks: 'Descontento puntual en núcleos rurales por mantenimiento de caminos.',
    mainAdversaries: 'PP (3 concejales) y Con Andalucía (sin representación, 9%).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 669, concejales: 6 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 371, concejales: 3 },
      { acronym: 'CON ANDALUCIA', name: 'Con Andalucía', colorHex: '#9333ea', isOwnParty: false, votes: 103, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Núcleo Central y Pedanías', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 2 },
    ],
  },
  {
    municipality: 'El Madroño',
    totalSeats: 7,
    census: 310,
    blankVotes: 4,
    nullVotes: 5,
    politicalGoal: 'DEFENSA',
    strengths: 'Hegemonía histórica (76.5% de voto y 5 de 7 concejales).',
    weaknesses: 'Población muy reducida y envejecida donde cada voto cuenta de forma crítica.',
    risks: 'Pérdida de censo por defunciones o traslados.',
    mainAdversaries: 'PP (2 concejales con 60 votos).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 195, concejales: 5 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 60, concejales: 2 },
    ],
    districts: [
      { code: 'D01', name: 'Término Municipal Único', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 1 },
    ],
  },
  {
    municipality: 'El Pedroso',
    totalSeats: 9,
    census: 1680,
    blankVotes: 15,
    nullVotes: 20,
    politicalGoal: 'DEFENSA',
    strengths: 'Amplia mayoría absoluta (6 concejales, 65.9% de voto) y dinamismo turístico.',
    weaknesses: 'Gestión de servicios de temporada y presión sobre agua y residuos.',
    risks: 'Campaña agresiva de la oposición centrada en fiscalidad.',
    mainAdversaries: 'PP (3 concejales).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 849, concejales: 6 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 440, concejales: 3 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Urbano y Estación', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 2 },
    ],
  },
  {
    municipality: 'El Real de la Jara',
    totalSeats: 9,
    census: 1220,
    blankVotes: 12,
    nullVotes: 16,
    politicalGoal: 'DEFENSA',
    strengths: 'Mayoría de 6 concejales frente a 3 del PP (65.7% de los votos).',
    weaknesses: 'Enclave limítrofe con Extremadura con demandas singulares de conectividad.',
    risks: 'Desafección en jóvenes por empleo estacional.',
    mainAdversaries: 'PP (3 concejales con 310 votos).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 595, concejales: 6 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 310, concejales: 3 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Municipal y Riberas', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 2 },
    ],
  },
  {
    municipality: 'El Ronquillo',
    totalSeats: 9,
    census: 1280,
    blankVotes: 11,
    nullVotes: 15,
    politicalGoal: 'GANAR',
    strengths: 'Casi empate con el PP (434 votos frente a 442, solo 8 votos de diferencia).',
    weaknesses: 'Con Andalucía obtuvo 1 concejal (157 votos) y es clave para el gobierno.',
    risks: 'División del voto progresista que facilite la continuidad del PP.',
    mainAdversaries: 'PP (4 concejales), Con Andalucía (1 concejal) y VOX.',
    parties: [
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 442, concejales: 4 },
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 434, concejales: 4 },
      { acronym: 'CON ANDALUCIA', name: 'Con Andalucía', colorHex: '#9333ea', isOwnParty: false, votes: 157, concejales: 1 },
      { acronym: 'VOX', name: 'VOX', colorHex: '#22c55e', isOwnParty: false, votes: 13, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Urbano y Lagos', censusFraction: 1.0, classification: 'COMPETENCIA_ABIERTA', mesas: 2 },
    ],
  },
  {
    municipality: 'Guadalcanal',
    totalSeats: 11,
    census: 2150,
    blankVotes: 21,
    nullVotes: 28,
    politicalGoal: 'GANAR',
    strengths: 'Gran fortaleza con 5 concejales y 755 votos a solo 1 concejal de la mayoría.',
    weaknesses: 'PP con mayoría absoluta de 6 concejales apoyado en el sector comercial local.',
    risks: 'Fuga de voto residual a formaciones de derecha.',
    mainAdversaries: 'PP (6 concejales) y VOX (47 votos, sin concejales).',
    parties: [
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 899, concejales: 6 },
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 755, concejales: 5 },
      { acronym: 'VOX', name: 'VOX', colorHex: '#22c55e', isOwnParty: false, votes: 47, concejales: 0 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Histórico y Ermitas', censusFraction: 1.0, classification: 'COMPETENCIA_ABIERTA', mesas: 3 },
    ],
  },
  {
    municipality: 'Las Navas de la Concepción',
    totalSeats: 9,
    census: 1350,
    blankVotes: 10,
    nullVotes: 14,
    politicalGoal: 'DEFENSA',
    strengths: 'Mayoría absoluta muy amplia (6 concejales, 63.3% del voto).',
    weaknesses: 'Aislamiento geográfico en pleno Parque Natural que limita la actividad industrial.',
    risks: 'Desafección por pérdida de servicios bancarios y sanitarios comarcales.',
    mainAdversaries: 'PP (3 concejales con 329 votos).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 568, concejales: 6 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 329, concejales: 3 },
    ],
    districts: [
      { code: 'D01', name: 'Casco Urbano', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 2 },
    ],
  },
  {
    municipality: 'San Nicolás del Puerto',
    totalSeats: 7,
    census: 530,
    blankVotes: 6,
    nullVotes: 8,
    politicalGoal: 'DEFENSA',
    strengths: 'Apoyo masivo del 71.6% con 5 de 7 concejales y gran prestigio de gestión natural.',
    weaknesses: 'Censo muy reducido (530 electores).',
    risks: 'Confianza excesiva por los amplios márgenes del escrutinio 2023.',
    mainAdversaries: 'PP (2 concejales con 134 votos).',
    parties: [
      { acronym: 'PSOE-A', name: 'Partido Socialista Obrero Español de Andalucía', colorHex: '#ef4444', isOwnParty: true, votes: 338, concejales: 5 },
      { acronym: 'PP', name: 'Partido Popular', colorHex: '#2563eb', isOwnParty: false, votes: 134, concejales: 2 },
    ],
    districts: [
      { code: 'D01', name: 'Casco y Ribera del Huéznar', censusFraction: 1.0, classification: 'FORTALEZA', mesas: 1 },
    ],
  },
];

async function seed() {
  console.log('🚀 Iniciando inserción de los 12 municipios reales de la Sierra Morena / Sierra Norte de Sevilla...');

  // Eliminar la campaña ficticia 'Valle Real' si existe
  const dummyCampaign = await prisma.campaign.findFirst({
    where: { municipality: 'Valle Real' },
  });
  if (dummyCampaign) {
    console.log('🧹 Limpiando campaña ficticia Valle Real...');
    await prisma.campaign.delete({ where: { id: dummyCampaign.id } });
  }

  for (const m of municipalities) {
    console.log(`📌 Procesando municipio: ${m.municipality}...`);

    // Comprobar si ya existe
    let campaign = await prisma.campaign.findFirst({
      where: { municipality: m.municipality },
    });

    if (campaign) {
      // Eliminar campaña anterior para recrearla limpia con todos sus distritos y resultados exactos
      await prisma.campaign.delete({ where: { id: campaign.id } });
    }

    // 1. Crear Campaña
    campaign = await prisma.campaign.create({
      data: {
        name: `Ruta ${m.municipality} 2027`,
        municipality: m.municipality,
        candidacyName: `PSOE-A ${m.municipality}`,
        partyOrCoalition: 'PSOE-A',
        politicalGoal: m.politicalGoal,
        electionDate: new Date('2027-05-23T09:00:00.000Z'),
        teamDescription: `Comité de campaña local de ${m.municipality}, equipo de voluntariado y apoderados.`,
        availableResources: `Sede local, material de campaña, redes comarcales y presupuesto asignado.`,
        mainAdversaries: m.mainAdversaries,
        strengths: m.strengths,
        weaknesses: m.weaknesses,
        risks: m.risks,
      },
    });

    // 2. Crear Partidos
    const partyVotesSum = m.parties.reduce((acc, p) => acc + p.votes, 0);
    const validVotesTotal = partyVotesSum + m.blankVotes;
    const turnoutTotal = validVotesTotal + m.nullVotes;

    const partyMap = new Map<string, string>();
    for (const p of m.parties) {
      const pct = validVotesTotal > 0 ? (p.votes / validVotesTotal) * 100 : 0;
      const createdParty = await prisma.party.create({
        data: {
          campaignId: campaign.id,
          name: p.name,
          acronym: p.acronym,
          colorHex: p.colorHex,
          isOwnParty: p.isOwnParty,
          concejales2023: p.concejales,
          votes2023: p.votes,
          percent2023: parseFloat(pct.toFixed(2)),
          candidateName: p.candidateName || null,
        },
      });
      partyMap.set(p.acronym, createdParty.id);
    }

    // 3. Crear Distritos y Resultados Electorales 2023
    for (const d of m.districts) {
      const distCensus = Math.round(m.census * d.censusFraction);
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
        const distBlank = Math.round(m.blankVotes * d.censusFraction);
        const distNull = Math.round(m.nullVotes * d.censusFraction);
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
      { phaseNumber: 2, name: 'Definición del posicionamiento', startDate: new Date('2026-11-01'), endDate: new Date('2026-12-31'), status: 'PENDING', objectives: 'Tres prioridades irrenunciables, banco de mensajes y argumentarios comarcales.' },
      { phaseNumber: 3, name: 'Relación y presencia pública', startDate: new Date('2027-01-01'), endDate: new Date('2027-02-28'), status: 'PENDING', objectives: 'Reuniones sectoriales con asociaciones, ganaderos y comerciantes.' },
      { phaseNumber: 4, name: 'Activación del equipo', startDate: new Date('2027-03-01'), endDate: new Date('2027-03-31'), status: 'PENDING', objectives: 'Formación de interventores y apoderados para todas las mesas.' },
      { phaseNumber: 5, name: 'Contacto ciudadano', startDate: new Date('2027-04-01'), endDate: new Date('2027-05-06'), status: 'PENDING', objectives: 'Buzoneo integral, carpas informativas y puerta a puerta vecinal.' },
      { phaseNumber: 6, name: 'Campaña electoral oficial', startDate: new Date('2027-05-07'), endDate: new Date('2027-05-21'), status: 'PENDING', objectives: 'Disciplina de mensaje diario, mítines centrales y movilización del voto indeciso.' },
      { phaseNumber: 7, name: 'Tramo final y jornada electoral', startDate: new Date('2027-05-22'), endDate: new Date('2027-05-31'), status: 'PENDING', objectives: 'Cobertura del 100% de las mesas electorales y escrutinio.' },
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
        mainGoal: m.politicalGoal === 'GANAR'
          ? `Alcanzar la alcaldía de ${m.municipality} sumando la mayoría necesaria de concejales.`
          : `Revalidar la mayoría absoluta y la alcaldía de ${m.municipality} para consolidar el progreso local.`,
        targetAudience: 'Familias trabajadoras, agricultores, ganaderos, personas mayores y jóvenes rurales.',
        brandIdea1: `${m.municipality} avanza con hechos y cercanía.`,
        brandIdea2: 'Compromiso inquebrantable con nuestros servicios públicos y la sanidad rural.',
        brandIdea3: 'Futuro y oportunidades de empleo para fijar la población al territorio.',
        messagesToRepeat: `La gestión transparente, la cercanía con cada vecino y la defensa del bienestar en ${m.municipality}.`,
        topicsToAvoid: 'Polémicas nacionales estériles y confrontaciones personales.',
      },
    });

    // 6. Tres Prioridades Políticas Irrenunciables
    const priorities = [
      { orderNumber: 1, title: 'Empleo, Campo y Sector Primario', description: `Impulso a la ganadería extensiva, cooperativas locales y turismo de naturaleza en ${m.municipality}.`, targetMetric: '+15% de iniciativas de apoyo al sector agroganadero' },
      { orderNumber: 2, title: 'Sanidad y Servicios Públicos Comarcales', description: 'Defensa de las urgencias 24h, consultorios médicos y transporte regular hacia Sevilla.', targetMetric: '100% cobertura médica y mejora de frecuencias' },
      { orderNumber: 3, title: 'Vivienda y Juventud contra la Despoblación', description: 'Ayudas a la rehabilitación para jóvenes y dinamización cultural y deportiva.', targetMetric: 'Fijar 50 nuevas familias jóvenes en el municipio' },
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
        situationOverview: `Diagnóstico municipal de ${m.municipality} para las Elecciones Municipales de Mayo 2027.`,
        citizenProblems: 'Despoblación progresiva, escasez de vivienda en régimen de alquiler y necesidad de mejoras en infraestructuras viarias.',
        strengths: m.strengths,
        weaknesses: m.weaknesses,
        opportunities: 'Fondos europeos para desarrollo rural y auge del turismo ecológico y senderismo.',
        threats: m.risks,
        teamCapabilities: 'Estructura militante veterana con incorporación de nuevos perfiles jóvenes locales.',
        availableResources: 'Presupuesto de campaña comarcal, redes de voluntariado y apoyo de la agrupación local.',
      },
    });
  }

  console.log('✅ ¡Los 12 municipios han sido creados con éxito con sus datos reales de 2023!');
}

seed()
  .catch((e) => {
    console.error('❌ Error al insertar municipios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
