import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando datos de demostración para Ruta 2027...');

  // 1. Limpieza de datos previos
  await prisma.auditLog.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.weeklyMeeting.deleteMany();
  await prisma.competitorTracking.deleteMany();
  await prisma.messageBank.deleteMany();
  await prisma.actionTask.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.roadmapPhase.deleteMany();
  await prisma.campaignPriority.deleteMany();
  await prisma.campaignStrategy.deleteMany();
  await prisma.strategicDiagnostic.deleteMany();
  await prisma.electionResult2023.deleteMany();
  await prisma.party.deleteMany();
  await prisma.district.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  // 2. Usuarios del Equipo de Campaña
  const passwordHash = await bcrypt.hash('Demo2027!', 10);
  const superPasswordHash = await bcrypt.hash('super123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Administrador',
      email: 'superadmin@elecciones.local',
      passwordHash: superPasswordHash,
      role: 'ADMIN',
    },
  });

  const globalAdmin = await prisma.user.create({
    data: {
      name: 'Administrador General',
      email: 'admin@campana.es',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const globalSupervisor = await prisma.user.create({
    data: {
      name: 'Supervisor General (Observador)',
      email: 'supervisor@campana.es',
      passwordHash,
      role: 'GLOBAL_SUPERVISOR',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Elena Ramos (Directora)',
      email: 'directora@campana.es',
      passwordHash,
      role: 'CAMPAIGN_DIRECTOR',
    },
  });

  const candidate = await prisma.user.create({
    data: {
      name: 'Carlos Navarro (Candidato)',
      email: 'candidato@campana.es',
      passwordHash,
      role: 'CANDIDATE',
    },
  });

  const commLead = await prisma.user.create({
    data: {
      name: 'Lucía Morales (Comunicación)',
      email: 'comunicacion@campana.es',
      passwordHash,
      role: 'COMM_LEAD',
    },
  });

  const districtLeadCentro = await prisma.user.create({
    data: {
      name: 'Javier Domínguez (Distrito 1)',
      email: 'territorial1@campana.es',
      passwordHash,
      role: 'DISTRICT_LEAD',
    },
  });

  console.log('👤 Usuarios creados (Admin, Supervisor, Directora, Candidato, etc.)');

  // 3. Proyecto de Campaña Municipal
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Ruta Valle Real 2027',
      municipality: 'Valle Real',
      electionDate: new Date('2027-05-23T09:00:00.000Z'),
      candidacyName: 'Carlos Navarro - Avanza Valle Real',
      partyOrCoalition: 'Avanza Valle Real (Coalición Municipal)',
      politicalGoal: 'GANAR', // GANAR, GOBERNAR, REPRESENTACION
      teamDescription: 'Comité de campaña de 12 personas, 85 voluntarios activos en 6 distritos.',
      availableResources: 'Presupuesto estimado: 45.000€, local céntrico y red digital propia.',
      mainAdversaries: 'PP (actual alcaldía con mayoría simple), PSOE (oposición histórica), VOX.',
      strengths: 'Candidato muy valorado en distritos periféricos, credibilidad en gestión económica y cercanía.',
      weaknesses: 'Menor penetración en el Distrito 1 (Centro histórico residencial) y recursos inferiores al partido de gobierno.',
      risks: 'Fragmentación del voto del cambio y desmovilización por desafección ciudadana.',
    },
  });

  console.log('🏛️ Campaña creada');

  // 4. Distritos Electorales
  const distritosData = [
    {
      code: 'D01',
      name: 'Distrito 1 - Centro Histórico',
      electoralRoll: 14200,
      pollingStationsCount: 18,
      mainIssues: 'Peatonalización conflictiva, ruido nocturno, aparcamiento regulado y envejecimiento demográfico.',
      territorialFeatures: 'Comercio tradicional, clase media-alta, alta participación electoral.',
      targetAudience: 'Comerciantes locales y familias de clase media.',
      strategicGoal: 'Contener la pérdida y disputar el segundo puesto al partido gobernante.',
      classification: 'DEFENSA',
      leadUserId: districtLeadCentro.id,
    },
    {
      code: 'D02',
      name: 'Distrito 2 - San Pedro y Ensanche',
      electoralRoll: 18500,
      pollingStationsCount: 24,
      mainIssues: 'Mantenimiento de zonas verdes, colapso en horas punta y escasez de plazas escolares públicas.',
      territorialFeatures: 'Barrios residenciales nuevos, parejas jóvenes con hijos en edad escolar.',
      targetAudience: 'Familias jóvenes trabajadoras y profesionales.',
      strategicGoal: 'Crecimiento masivo: es el distrito clave con mayor bolsa de votantes indecisos.',
      classification: 'CRECIMIENTO',
    },
    {
      code: 'D03',
      name: 'Distrito 3 - Barrio Norte y Estación',
      electoralRoll: 13800,
      pollingStationsCount: 16,
      mainIssues: 'Seguridad percibida, iluminación deficiente, limpieza urbana y falta de inversión municipal.',
      territorialFeatures: 'Población obrera, diversidad cultural, desafección política y alta abstención.',
      targetAudience: 'Jóvenes sin empleo estable y pensionistas con rentas bajas.',
      strategicGoal: 'Movilización urgente del voto abstencionista.',
      classification: 'BAJA_PARTICIPACION',
    },
    {
      code: 'D04',
      name: 'Distrito 4 - La Vega y El Carmen',
      electoralRoll: 16200,
      pollingStationsCount: 20,
      mainIssues: 'Acceso a la vivienda para jóvenes, transporte público deficiente hacia el hospital comarcal.',
      territorialFeatures: 'Zona con gran arraigo asociativo y tradición de participación vecinal.',
      targetAudience: 'Asociaciones vecinales, jóvenes emancipados y sanitarios.',
      strategicGoal: 'Consolidar hegemonía clara: es nuestro principal feudo electoral.',
      classification: 'FORTALEZA',
    },
    {
      code: 'D05',
      name: 'Distrito 5 - Polígono y Pedanías',
      electoralRoll: 9600,
      pollingStationsCount: 12,
      mainIssues: 'Aislamiento de transporte, servicios médicos rurales limitados y estado de caminos rurales.',
      territorialFeatures: 'Núcleos diseminados, polígono industrial activo y sector agrícola periurbano.',
      targetAudience: 'Trabajadores del polígono industrial y vecinos de pedanías.',
      strategicGoal: 'Oportunidad de arrebatar votos al gobierno por sensación de abandono.',
      classification: 'OPORTUNIDAD',
    },
  ];

  const distritosMap = new Map<string, string>();
  for (const d of distritosData) {
    const dist = await prisma.district.create({
      data: {
        campaignId: campaign.id,
        ...d,
      },
    });
    distritosMap.set(d.code, dist.id);
  }

  console.log('📍 Distritos creados');

  // 5. Partidos y Candidaturas
  const partidosData = [
    {
      name: 'Avanza Valle Real',
      acronym: 'AVANZA',
      colorHex: '#16a34a', // Verde victoria
      isOwnParty: true,
      candidateName: 'Carlos Navarro',
      concejales2023: 7,
      votes2023: 13420,
      percent2023: 27.8,
      mainTopics: 'Regeneración, vivienda asequible, cercanía vecinal y modernización de servicios.',
      strengths: 'Liderazgo sólido, cohesión del equipo y arraigo en distritos populares.',
      weaknesses: 'Presupuesto más ajustado frente a la maquinaria institucional.',
    },
    {
      name: 'Partido Popular',
      acronym: 'PP',
      colorHex: '#2563eb', // Azul
      isOwnParty: false,
      candidateName: 'Marta Soto (Alcaldesa)',
      concejales2023: 9,
      votes2023: 16850,
      percent2023: 34.9,
      mainTopics: 'Estabilidad institucional, atracción empresarial y bajada de impuestos.',
      strengths: 'Control del gobierno local y fidelidad de voto en Distrito 1.',
      weaknesses: 'Desgaste por gestión deficiente de la limpieza y quejas en barrios periféricos.',
    },
    {
      name: 'Partido Socialista Obrero Español',
      acronym: 'PSOE',
      colorHex: '#dc2626', // Rojo
      isOwnParty: false,
      candidateName: 'Andrés Gil',
      concejales2023: 6,
      votes2023: 11200,
      percent2023: 23.2,
      mainTopics: 'Servicios sociales, memoria democrática e inversión estatal.',
      strengths: 'Marca consolidada en mayores de 60 años.',
      weaknesses: 'Candidato poco conocido y pérdida de pulso en barrios obreros a favor de Avanza.',
    },
    {
      name: 'VOX',
      acronym: 'VOX',
      colorHex: '#4ade80', // Verde lima
      isOwnParty: false,
      candidateName: 'Ignacio Rueda',
      concejales2023: 2,
      votes2023: 4150,
      percent2023: 8.6,
      mainTopics: 'Seguridad en barrios, reducción del gasto político y oposición frontal.',
      strengths: 'Discurso duro en Distrito 3 y zonas del Polígono.',
      weaknesses: 'Estructura local muy débil y ausencia de propuestas de gestión municipal.',
    },
    {
      name: 'Izquierda Unida - Podemos',
      acronym: 'IU-PODEMOS',
      colorHex: '#9333ea', // Morado
      isOwnParty: false,
      candidateName: 'Carmen Serrano',
      concejales2023: 1,
      votes2023: 2650,
      percent2023: 5.5,
      mainTopics: 'Ecología urbana, feminismo y servicios 100% públicos.',
      strengths: 'Militancia activa en movimientos ecologistas y culturales.',
      weaknesses: 'Riesgo inminente de quedar por debajo de la barrera del 5%.',
    },
  ];

  const partidosMap = new Map<string, string>();
  for (const p of partidosData) {
    const party = await prisma.party.create({
      data: {
        campaignId: campaign.id,
        ...p,
      },
    });
    partidosMap.set(p.acronym, party.id);
  }

  console.log('🗳️ Partidos creados');

  // 6. Resultados Electorales 2023 (Línea Base por Distrito)
  const electionData = [
    // D01 Centro (PP lidera)
    { dCode: 'D01', pAcr: 'PP', votes: 5200, percent: 49.5, concejales: 0, census: 14200, turnout: 10500, abstention: 3700, valid: 10400, blank: 80, nullV: 20 },
    { dCode: 'D01', pAcr: 'AVANZA', votes: 2350, percent: 22.4, concejales: 0, census: 14200, turnout: 10500, abstention: 3700, valid: 10400, blank: 80, nullV: 20 },
    { dCode: 'D01', pAcr: 'PSOE', votes: 1650, percent: 15.7, concejales: 0, census: 14200, turnout: 10500, abstention: 3700, valid: 10400, blank: 80, nullV: 20 },
    { dCode: 'D01', pAcr: 'VOX', votes: 900, percent: 8.6, concejales: 0, census: 14200, turnout: 10500, abstention: 3700, valid: 10400, blank: 80, nullV: 20 },
    { dCode: 'D01', pAcr: 'IU-PODEMOS', votes: 300, percent: 2.9, concejales: 0, census: 14200, turnout: 10500, abstention: 3700, valid: 10400, blank: 80, nullV: 20 },

    // D02 Ensanche (Muy disputado entre PP y AVANZA)
    { dCode: 'D02', pAcr: 'PP', votes: 4600, percent: 36.8, concejales: 0, census: 18500, turnout: 12500, abstention: 6000, valid: 12380, blank: 120, nullV: 0 },
    { dCode: 'D02', pAcr: 'AVANZA', votes: 4100, percent: 32.8, concejales: 0, census: 18500, turnout: 12500, abstention: 6000, valid: 12380, blank: 120, nullV: 0 },
    { dCode: 'D02', pAcr: 'PSOE', votes: 2200, percent: 17.6, concejales: 0, census: 18500, turnout: 12500, abstention: 6000, valid: 12380, blank: 120, nullV: 0 },
    { dCode: 'D02', pAcr: 'VOX', votes: 980, percent: 7.8, concejales: 0, census: 18500, turnout: 12500, abstention: 6000, valid: 12380, blank: 120, nullV: 0 },
    { dCode: 'D02', pAcr: 'IU-PODEMOS', votes: 500, percent: 4.0, concejales: 0, census: 18500, turnout: 12500, abstention: 6000, valid: 12380, blank: 120, nullV: 0 },

    // D03 Barrio Norte (Baja participación, AVANZA y PSOE disputan)
    { dCode: 'D03', pAcr: 'AVANZA', votes: 2450, percent: 31.8, concejales: 0, census: 13800, turnout: 7700, abstention: 6100, valid: 7600, blank: 70, nullV: 30 },
    { dCode: 'D03', pAcr: 'PSOE', votes: 2400, percent: 31.2, concejales: 0, census: 13800, turnout: 7700, abstention: 6100, valid: 7600, blank: 70, nullV: 30 },
    { dCode: 'D03', pAcr: 'PP', votes: 1550, percent: 20.1, concejales: 0, census: 13800, turnout: 7700, abstention: 6100, valid: 7600, blank: 70, nullV: 30 },
    { dCode: 'D03', pAcr: 'VOX', votes: 750, percent: 9.7, concejales: 0, census: 13800, turnout: 7700, abstention: 6100, valid: 7600, blank: 70, nullV: 30 },
    { dCode: 'D03', pAcr: 'IU-PODEMOS', votes: 450, percent: 5.8, concejales: 0, census: 13800, turnout: 7700, abstention: 6100, valid: 7600, blank: 70, nullV: 30 },

    // D04 La Vega (Feudo AVANZA)
    { dCode: 'D04', pAcr: 'AVANZA', votes: 3620, percent: 36.2, concejales: 0, census: 16200, turnout: 10000, abstention: 6200, valid: 9900, blank: 90, nullV: 10 },
    { dCode: 'D04', pAcr: 'PSOE', votes: 3300, percent: 33.0, concejales: 0, census: 16200, turnout: 10000, abstention: 6200, valid: 9900, blank: 90, nullV: 10 },
    { dCode: 'D04', pAcr: 'PP', votes: 2100, percent: 21.0, concejales: 0, census: 16200, turnout: 10000, abstention: 6200, valid: 9900, blank: 90, nullV: 10 },
    { dCode: 'D04', pAcr: 'IU-PODEMOS', votes: 800, percent: 8.0, concejales: 0, census: 16200, turnout: 10000, abstention: 6200, valid: 9900, blank: 90, nullV: 10 },
    { dCode: 'D04', pAcr: 'VOX', votes: 80, percent: 0.8, concejales: 0, census: 16200, turnout: 10000, abstention: 6200, valid: 9900, blank: 90, nullV: 10 },

    // D05 Polígono y Pedanías (PP y AVANZA)
    { dCode: 'D05', pAcr: 'PP', votes: 3400, percent: 43.6, concejales: 0, census: 9600, turnout: 7800, abstention: 1800, valid: 7700, blank: 60, nullV: 40 },
    { dCode: 'D05', pAcr: 'PSOE', votes: 1650, percent: 21.2, concejales: 0, census: 9600, turnout: 7800, abstention: 1800, valid: 7700, blank: 60, nullV: 40 },
    { dCode: 'D05', pAcr: 'VOX', votes: 1470, percent: 18.8, concejales: 0, census: 9600, turnout: 7800, abstention: 1800, valid: 7700, blank: 60, nullV: 40 },
    { dCode: 'D05', pAcr: 'AVANZA', votes: 900, percent: 11.5, concejales: 0, census: 9600, turnout: 7800, abstention: 1800, valid: 7700, blank: 60, nullV: 40 },
    { dCode: 'D05', pAcr: 'IU-PODEMOS', votes: 600, percent: 7.7, concejales: 0, census: 9600, turnout: 7800, abstention: 1800, valid: 7700, blank: 60, nullV: 40 },
  ];

  for (const item of electionData) {
    const districtId = distritosMap.get(item.dCode)!;
    const partyId = partidosMap.get(item.pAcr)!;

    await prisma.electionResult2023.create({
      data: {
        districtId,
        partyId,
        census: item.census,
        turnout: item.turnout,
        abstention: item.abstention,
        validVotes: item.valid,
        blankVotes: item.blank,
        nullVotes: item.nullV,
        votes: item.votes,
        percent: item.percent,
        concejales: 0,
      },
    });
  }

  console.log('📊 Resultados 2023 creados');

  // 7. Diagnóstico Estratégico (DAFO Municipal)
  await prisma.strategicDiagnostic.create({
    data: {
      campaignId: campaign.id,
      situationOverview: 'Gobierno municipal conservador en minoría desgastado tras 8 años. Fuerte malestar por el estado de los barrios frente a la inversión exclusiva en el centro.',
      citizenProblems: '1. Limpieza y suciedad en calles. 2. Falta de vivienda asequible para jóvenes. 3. Deterioro de centros de salud y transporte interurbano.',
      strengths: 'Candidato cercano, sin escándalos de corrupción y proyecto municipal integrador.',
      weaknesses: 'Poco conocimiento en sectores mayores del Distrito 1.',
      opportunities: 'Gran masa de votantes jóvenes desilusionados en el Distrito 2 y alta abstención movilizable en el Distrito 3.',
      threats: 'Campaña sucia de polarización en redes por parte de adversarios.',
      teamCapabilities: 'Red de más de 80 activistas en calle y equipo de comunicación ágil.',
      availableResources: '45.000€ y sede en ubicación estratégica.',
    },
  });

  // 8. Estrategia Central y 3 Prioridades Políticas
  const strategy = await prisma.campaignStrategy.create({
    data: {
      campaignId: campaign.id,
      mainGoal: 'Ganar la alcaldía obteniendo al menos 10 concejales (+3 respecto a 2023).',
      targetAudience: 'Familias trabajadoras y jóvenes menores de 40 años desencantados con el bipartidismo.',
      brandIdea1: 'Un Valle Real para vivir, no para marcharse.',
      brandIdea2: 'El alcalde de todos los barrios, no solo del centro.',
      brandIdea3: 'Gestión rigurosa y transparencia radical.',
      messagesToRepeat: 'Inversión equitativa en los 5 distritos; plan de choque de limpieza en 100 días; vivienda joven protegida.',
      topicsToAvoid: 'Debates ideológicos de política estatal ajenos a los problemas reales de Valle Real.',
    },
  });

  const p1 = await prisma.campaignPriority.create({
    data: {
      campaignId: campaign.id,
      orderNumber: 1,
      title: 'Plan de Choque en Barrios: Limpieza, Seguridad y Mantenimiento',
      description: 'Garantizar que ningún barrio esté abandonado frente al centro.',
      targetMetric: 'Aumentar presencia en 4 visitas semanales a los Distritos 2, 3 y 5.',
    },
  });

  const p2 = await prisma.campaignPriority.create({
    data: {
      campaignId: campaign.id,
      orderNumber: 2,
      title: 'Vivienda Asequible para Jóvenes y Familias',
      description: 'Movilización de suelo municipal para alquiler protegido y rehabilitación.',
      targetMetric: '300 viviendas públicas en 4 años como compromiso central del programa.',
    },
  });

  const p3 = await prisma.campaignPriority.create({
    data: {
      campaignId: campaign.id,
      orderNumber: 3,
      title: 'Revitalización Económica Local y Empleo Joven',
      description: 'Bono comercial municipal, reducción de trabas a autónomos y formación profesional en el Polígono.',
      targetMetric: 'Acuerdo con asociaciones de comercio y pymes locales.',
    },
  });

  console.log('🎯 Estrategia y 3 Prioridades creadas');

  // 9. Hoja de Ruta (7 Fases 2026 - 2027)
  const phasesData = [
    { num: 1, name: 'Diagnóstico y preparación', start: '2026-09-01', end: '2026-10-31', status: 'IN_PROGRESS', obj: 'Censo de voluntariado, diagnóstico DAFO por distrito y cierre del presupuesto.' },
    { num: 2, name: 'Definición del posicionamiento', start: '2026-11-01', end: '2026-12-31', status: 'PENDING', obj: 'Lanzamiento de las 3 ideas fuerza y proclamación oficial del candidato.' },
    { num: 3, name: 'Construcción de relación y presencia pública', start: '2027-01-01', end: '2027-02-28', status: 'PENDING', obj: 'Ronda de 50 reuniones sectoriales con comerciantes, sanitarios y colectivos vecinales.' },
    { num: 4, name: 'Activación del equipo y precampaña', start: '2027-03-01', end: '2027-03-31', status: 'PENDING', obj: 'Despliegue de carpas en todos los distritos y captación masiva de apoderados.' },
    { num: 5, name: 'Contacto ciudadano intensivo', start: '2027-04-01', end: '2027-04-30', status: 'PENDING', obj: 'Puerta a puerta en Distritos 2 y 3, reparto del folleto de balance.' },
    { num: 6, name: 'Campaña electoral oficial', start: '2027-05-07', end: '2027-05-21', status: 'PENDING', obj: 'Acto central, debate televisivo y caravana diaria por cada barrio.' },
    { num: 7, name: 'Tramo final y movilización', start: '2027-05-22', end: '2027-05-23', status: 'PENDING', obj: 'Jornada de reflexión y operativo de interventores y apoderados en las 90 mesas.' },
  ];

  for (const ph of phasesData) {
    const phase = await prisma.roadmapPhase.create({
      data: {
        campaignId: campaign.id,
        phaseNumber: ph.num,
        name: ph.name,
        startDate: new Date(ph.start),
        endDate: new Date(ph.end),
        status: ph.status,
        objectives: ph.obj,
      },
    });

    if (ph.num === 1) {
      await prisma.milestone.create({
        data: {
          phaseId: phase.id,
          title: 'Finalizar diagnóstico territorial de los 5 distritos',
          dueDate: new Date('2026-09-30'),
          responsibleId: admin.id,
          isCompleted: true,
        },
      });
      await prisma.milestone.create({
        data: {
          phaseId: phase.id,
          title: 'Cierre del comité de campaña y asignación de 5 coordinadores',
          dueDate: new Date('2026-10-15'),
          responsibleId: admin.id,
          isCompleted: false,
        },
      });
    }
  }

  console.log('🗺️ Hoja de ruta creada');

  // 10. Acciones y Tareas para "Esta Semana"
  const tareasEstaSemana = [
    {
      type: 'VISIT',
      title: 'Paseo ciudadano y reunión con comerciantes del Ensanche',
      description: 'Recorrer la Avenida del Parque para escuchar quejas sobre falta de aparcamiento e iluminación.',
      districtId: distritosMap.get('D02'),
      priorityId: p1.id,
      responsibleId: candidate.id,
      dueDate: new Date('2026-09-22T17:30:00.000Z'),
      status: 'IN_PROGRESS',
      targetAudience: 'Comerciantes y familias del barrio.',
      keyMessage: 'Plan de choque de mantenimiento y parking rotatorio gratuito.',
    },
    {
      type: 'TASK',
      title: 'Diseño de la infografía: Las mentiras del plan de limpieza del PP',
      description: 'Comparar el gasto presupuestado vs el gasto realmente ejecutado en los últimos 3 años.',
      priorityId: p1.id,
      competitorPartyId: partidosMap.get('PP'),
      responsibleId: commLead.id,
      dueDate: new Date('2026-09-20T14:00:00.000Z'),
      status: 'PENDING',
      targetAudience: 'Usuarios de redes sociales y grupos de WhatsApp.',
      keyMessage: 'El gobierno promete millones que luego no gasta en nuestros barrios.',
    },
    {
      type: 'MEETING',
      title: 'Reunión con Plataforma de Afectados por el Alquiler',
      description: 'Presentar el borrador del programa de vivienda y recoger propuestas ciudadanas.',
      districtId: distritosMap.get('D04'),
      priorityId: p2.id,
      responsibleId: candidate.id,
      dueDate: new Date('2026-09-23T19:00:00.000Z'),
      status: 'PENDING',
      targetAudience: 'Jóvenes y familias vulnerables.',
      keyMessage: 'Empadronamiento justo y movilización de viviendas vacías.',
    },
    {
      type: 'TASK',
      title: 'Comprobar listas del censo y locales de votación del Distrito 3',
      description: 'Verificar accesibilidad de los 4 colegios electorales principales tras las obras.',
      districtId: distritosMap.get('D03'),
      responsibleId: districtLeadCentro.id,
      dueDate: new Date('2026-09-25T12:00:00.000Z'),
      status: 'PENDING',
      targetAudience: 'Electorado general del Distrito 3.',
    },
  ];

  for (const t of tareasEstaSemana) {
    await prisma.actionTask.create({
      data: {
        campaignId: campaign.id,
        ...t,
      },
    });
  }

  // 11. Banco de Mensajes
  await prisma.messageBank.create({
    data: {
      campaignId: campaign.id,
      category: 'KEY_MESSAGE',
      title: 'Mensaje Central: Todos los Barrios Cuentan',
      content: 'Durante 8 años, la alcaldía ha gobernado mirando únicamente a dos calles del centro. Avanza Valle Real representa el compromiso de devolver la dignidad, la limpieza y los servicios públicos a cada rincón del municipio.',
    },
  });

  await prisma.messageBank.create({
    data: {
      campaignId: campaign.id,
      category: 'ATTACK_RESPONSE',
      title: 'Respuesta al ataque: "No tienen experiencia de gestión"',
      content: 'Nuestra candidatura combina profesionales con trayectorias de gestión intachable en la empresa privada, la sanidad y la educación pública. La supuesta "experiencia" de quienes llevan dos décadas en el sillón solo ha servido para acumular suciedad y deuda.',
    },
  });

  // 12. Radar de Competidores
  await prisma.competitorTracking.create({
    data: {
      partyId: partidosMap.get('PP')!,
      type: 'BLUNDER',
      title: 'Rueda de prensa fallida de la Alcaldesa sobre limpieza',
      description: 'La alcaldesa culpó a los vecinos del estado de los contenedores en el Distrito 3, provocando indignación vecinal.',
      opportunityToDifferentiate: 'Lanzar comunicado constructivo ofreciendo más inspectores y contenedores soterrados.',
      date: new Date('2026-09-17'),
    },
  });

  // 13. Reunión Semanal y Acta
  await prisma.weeklyMeeting.create({
    data: {
      campaignId: campaign.id,
      meetingDate: new Date('2026-09-16T18:00:00.000Z'),
      agenda: '1. Repaso de hitos fase 1. 2. Balance del acto en Distrito 4. 3. Asignación de tareas semanales.',
      decisionsTaken: 'Se aprueba concentrar la presencia del candidato 2 tardes a la semana en el Ensanche (Distrito 2).',
      roadblocks: 'Retraso en la entrega de material impreso de la sede.',
      priorityChanges: 'Reforzar el mensaje de vivienda como prioridad inmediata.',
      risksDetected: 'Posible anuncio de rebajas de IBI por el ayuntamiento antes de noviembre.',
    },
  });

  console.log('✅ Base de datos de demostración cargada con éxito');
}

main()
  .catch((e) => {
    console.error('Error al ejecutar el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
