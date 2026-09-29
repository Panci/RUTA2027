'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck,
  Compass,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Printer,
  Copy,
  ArrowRight,
  Edit3,
  Landmark,
  Target,
  Users,
  Megaphone,
  Scale,
  Footprints,
  CalendarCheck,
  Handshake,
  Shield,
  MessageSquare,
  Home,
  ShieldAlert,
  Coins,
  ShieldCheck,
  Clock,
  Mail,
  Award,
  Hourglass,
  Layers,
  Sliders,
  Info,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export type AnswerValue = 'yes' | 'half' | 'no';
export type AuditMode = '21' | '15';

export interface Question {
  id: string;
  num: number;
  text: string;
  detail: string;
  fixRecommendation: string;
}

export interface Block {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  iconName: string;
  questions: Question[];
}

export const BASE_BLOCKS: Block[] = [
  {
    id: 'b1',
    number: '01',
    title: 'Objetivos y situación de partida',
    subtitle: 'El lugar que ocupas y el papel que aspiras a jugar',
    iconName: 'target',
    questions: [
      {
        id: 'q1',
        num: 1,
        text: '¿Tienes claro qué resultado aspiras a obtener en las próximas elecciones (en votos, concejales o posición política)?',
        detail:
          'No vale con aspirar genéricamente a "ganar" o "crecer". Debes saber el umbral mínimo de concejales para condicionar gobierno o gobernar en solitario.',
        fixRecommendation:
          'Reunir al comité de campaña para fijar la cifra meta de sufragios con base en el censo actual y la barrera electoral del 5%.',
      },
      {
        id: 'q2',
        num: 2,
        text: '¿Has analizado cuál es la situación política actual del municipio y cómo puede afectar a tus posibilidades en las próximas elecciones?',
        detail:
          'Desgaste del equipo de gobierno local, divisiones en otros partidos, fracturas vecinales, coyuntura económica y clima de opinión ciudadana.',
        fixRecommendation:
          'Elaborar un DAFO político municipal cruzando el descontento vecinal con tus capacidades reales de capitalizarlo.',
      },
      {
        id: 'q3',
        num: 3,
        text: '¿Has revisado qué funcionó y qué falló en las elecciones anteriores para evitar repetir errores y aprovechar lo que sí dio resultado?',
        detail:
          'Hacer autocrítica fría: mesas electorales donde caísteis, mensajes que no calaron, fallos en movilización o actos que no aportaron votos.',
        fixRecommendation:
          'Conducir una sesión de auditoría histórica con las actas de la anterior contienda y listar 3 cosas a repetir y 3 errores a desterrar.',
      },
    ],
  },
  {
    id: 'b2',
    number: '02',
    title: 'Electorado y territorio',
    subtitle: 'A quién y a cuántos necesitas convencer en el municipio',
    iconName: 'users',
    questions: [
      {
        id: 'q4',
        num: 4,
        text: '¿Tienes calculados los votos que necesitas, identificados qué grupos pueden aportarlos y definido cómo vas a trabajar con ellos?',
        detail:
          'Segmentación demográfica y sociolaboral: jóvenes primerizos, familias con hijos, jubilados, autónomos y comerciantes.',
        fixRecommendation:
          'Segmentar al electorado en tres franjas (fieles, dudosos/flotantes y refractarios) y asignar responsables específicos a cada uno.',
      },
      {
        id: 'q5',
        num: 5,
        text: '¿Tienes localizadas qué zonas del municipio te son favorables, cuáles son dudosas y cuáles resultan más difíciles para tu proyecto?',
        detail:
          'Geografía electoral: barrios consolidados, urbanizaciones periféricas, pedanías, cascos históricos. Cada uno vota por dinámicas distintas.',
        fixRecommendation:
          'Pintar un mapa zonal por secciones censales diferenciando zonas prioritarias para movilizar frente a zonas perdidas que no compensan inversión.',
      },
      {
        id: 'q6',
        num: 6,
        text: '¿Conoces las principales preocupaciones de la población de tu municipio?',
        detail:
          'Diferenciar entre las obsesiones de los partidos (temas ideológicos abstractos) y lo que de verdad desvela al vecino (limpieza, seguridad, aparcamiento, tasas, ruidos).',
        fixRecommendation:
          'Lanzar un buzón de escucha activa o encuesta barrial estructurada para jerarquizar el "Top 5" de quejas cotidianas reales.',
      },
      {
        id: 'q7',
        num: 7,
        text: '¿Dispones de algún indicador objetivo sobre cómo valoran hoy tu proyecto y la acción política que vienes realizando en este mandato?',
        detail:
          'Sondeos cuantitativos, focus groups, seguimiento sistemático de interacciones digitales o métricas de asistencia a actos propios.',
        fixRecommendation:
          'Abandonar el "termómetro de los simpatizantes afines" y encargar un sondeo o muestreo riguroso antes de precampaña.',
      },
    ],
  },
  {
    id: 'b3',
    number: '03',
    title: 'Mensaje y temas',
    subtitle: 'Qué decir y por qué te van a recordar los vecinos',
    iconName: 'megaphone',
    questions: [
      {
        id: 'q8',
        num: 8,
        text: '¿Has formulado ya de manera clara el mensaje que quieres transmitir durante la campaña?',
        detail:
          'Una frase o concepto eje que sintetice qué representas y hacia dónde quieres llevar el municipio. Si tu mensaje no cabe en una frase, no existe.',
        fixRecommendation:
          'Sintetizar la propuesta de valor en un concepto fuerza (ej. "El cambio sensato", "Cuidar nuestro pueblo") que guíe todas las notas de prensa y discursos.',
      },
      {
        id: 'q9',
        num: 9,
        text: '¿Has definido los temas que quieres trabajar de manera prioritaria en esta elección?',
        detail:
          'Seleccionar de 3 a 5 asuntos clave donde tengas autoridad moral y propuestas solventes. El que intenta hablar de 50 temas no fija ninguno en la mente colectiva.',
        fixRecommendation:
          'Elegir tus 3 "banderas electorales" y descartar conscientemente responder a los temas trampa que intente colocar el rival.',
      },
    ],
  },
  {
    id: 'b4',
    number: '04',
    title: 'Razón de voto y objeciones',
    subtitle: 'Los motivos por los que te prefieren a ti',
    iconName: 'scale',
    questions: [
      {
        id: 'q10',
        num: 10,
        text: '¿Tienes claro por qué la gente debería votarte en estas elecciones?',
        detail:
          'La respuesta rotunda al beneficio de respaldar tu candidatura. No es "porque somos honestos", sino qué cambiará en el día a día de sus vidas.',
        fixRecommendation:
          'Redactar el "contrato con el vecino": 5 compromisos tangibles para los primeros 100 días de gobierno.',
      },
      {
        id: 'q11',
        num: 11,
        text: '¿Has identificado las objeciones principales que pueden tener hacia ti o tu partido y cómo responderlas?',
        detail:
          'Anticipar los ataques del adversario y los recelos del ciudadano indeciso (falta de experiencia, pactos polémicos, desgaste personal, etc.).',
        fixRecommendation:
          'Elaborar un argumentario de defensa y contraataque con preguntas incómodas y respuestas breves ensayadas por todo el equipo.',
      },
    ],
  },
  {
    id: 'b5',
    number: '05',
    title: 'Territorio y presencia pública',
    subtitle: 'Agenda de calle y contacto personal',
    iconName: 'footprints',
    questions: [
      {
        id: 'q12',
        num: 12,
        text: '¿Estás recorriendo ya el municipio de manera regular para reunirte con vecinos, con los principales sectores y con el tejido asociativo?',
        detail:
          'Presencia física constante. Si solo te ven a dos meses de las elecciones pidiendo el voto, se percibe como oportunismo electoral.',
        fixRecommendation:
          'Diseñar un calendario de "puerta a puerta" y café con colectivos vecinales con un mínimo de 3 salidas por semana.',
      },
      {
        id: 'q13',
        num: 13,
        text: '¿Estás recogiendo y organizando la información que te trasladan en los encuentros y reuniones para usarla luego en la preparación de la campaña?',
        detail:
          'Escuchar no basta si la libreta queda guardada. Debe existir un sistema estructurado (CRM, hoja compartida) para nutrir el programa electoral.',
        fixRecommendation:
          'Nombrar un relator o secretario de actas en cada visita que vuelque las demandas barriales en la matriz del programa de gobierno.',
      },
    ],
  },
  {
    id: 'b6',
    number: '06',
    title: 'Preparación interna y planificación',
    subtitle: 'La organización del equipo y la distribución del trabajo',
    iconName: 'calendarCheck',
    questions: [
      {
        id: 'q14',
        num: 14,
        text: '¿Hay un grupo de personas trabajando ya en la preparación de las próximas elecciones?',
        detail:
          'Comité de campaña formal con roles separados: director de campaña, responsable de movilización, comunicación/redes, tesorería y programa.',
        fixRecommendation:
          'Crear un comité operativo pequeño (3 a 5 personas) con reunión ejecutiva fija semanal y actas de compromisos.',
      },
      {
        id: 'q15',
        num: 15,
        text: '¿Se están marcando ya en el calendario los hitos más importantes de la precampaña y la campaña?',
        detail:
          'Cronograma de fechas críticas: presentación de candidatura, actos centrales, publicación del programa, pegada de carteles y día D de apoderados.',
        fixRecommendation:
          'Elaborar un cronograma tipo Gantt hacia atrás desde el domingo de votaciones con hitos quincenales inamovibles.',
      },
    ],
  },
];

export const EXTENDED_BLOCKS: Block[] = [
  {
    id: 'b7',
    number: '07',
    title: 'Gobernabilidad y política de alianzas',
    subtitle: 'Mayorías de investidura y acuerdos postelectorales',
    iconName: 'handshake',
    questions: [
      {
        id: 'q16',
        num: 16,
        text: '¿Tienes definido el escenario de pactos y sabes qué mayoría alternativa o de gobierno necesitas construir?',
        detail:
          'En tiempos de fragmentación, ganar en votos y perder la alcaldía es común. Se debe prever con quién pactar, qué líneas rojas fijar y qué acuerdos premiará o castigará tu electorado.',
        fixRecommendation:
          'Realizar una simulación matemática de reparto por Ley D\'Hondt con tres hipótesis de participación y fijar la narrativa pública sobre posibles coaliciones.',
      },
    ],
  },
  {
    id: 'b8',
    number: '08',
    title: 'Blindaje de marca e identidad local',
    subtitle: 'Candidato vs. sigla y aislamiento del ruido estatal',
    iconName: 'shield',
    questions: [
      {
        id: 'q17',
        num: 17,
        text: '¿Tienes calculada la relación entre la marca de tu partido y la marca personal de tu candidato/a, y cómo protegerte del clima político nacional?',
        detail:
          'Medir si la sigla estatal suma o resta en el municipio. Si resta, la campaña debe volverse hiperlocal, acentuando la figura del candidato/a y los problemas cotidianos vecinales.',
        fixRecommendation:
          'Diseñar un código visual y temático 100% municipalista que desactive la polarización partidista nacional en debates locales.',
      },
    ],
  },
  {
    id: 'b9',
    number: '09',
    title: 'Canales directos y conversación privada',
    subtitle: 'WhatsApp, Telegram y penetración en el votante no militante',
    iconName: 'messageSquare',
    questions: [
      {
        id: 'q18',
        num: 18,
        text: '¿Dispones de una estrategia de canales directos (WhatsApp, Telegram o microsegmentación digital) que no dependa solo de las redes sociales corporativas?',
        detail:
          'Las redes corporativas suelen llegar solo a los afines. El voto flotante y las familias conversan en grupos vecinales de WhatsApp, canales temáticos y vídeos cortos de consumo rápido.',
        fixRecommendation:
          'Lanzar una línea ciudadana de WhatsApp y consolidar una red de 20 a 50 prescriptores barriales que compartan contenidos nativos y concisos.',
      },
    ],
  },
  {
    id: 'b10',
    number: '10',
    title: 'Nuevos vecinos y desafección generacional',
    subtitle: 'Zonas dormitorio, recién empadronados y menores de 35 años',
    iconName: 'home',
    questions: [
      {
        id: 'q19',
        num: 19,
        text: '¿Has diseñado una estrategia específica para llegar a la población sin arraigo tradicional (nuevos residentes, barrios dormitorio y menores de 35 años)?',
        detail:
          'La abstención en nuevas urbanizaciones y en juventud supera con frecuencia el 45%. Movilizar solo un 5% de este colectivo decanta concejales clave.',
        fixRecommendation:
          'Crear formatos de encuentro ágiles y microcampañas geolocalizadas con propuestas concretas de vivienda, transporte y conciliación familiar.',
      },
    ],
  },
  {
    id: 'b11',
    number: '11',
    title: 'Gestión de crisis y guerra sucia local',
    subtitle: 'Protocolo de respuesta rápida ante bulos y difamaciones',
    iconName: 'shieldAlert',
    questions: [
      {
        id: 'q20',
        num: 20,
        text: '¿Cuenta la candidatura con un protocolo de respuesta rápida ante bulos, ataques personales o denuncias de última hora?',
        detail:
          'En las dos semanas finales proliferan libelos, cuentas anónimas o falsas denuncias. Tardar 48 horas en reaccionar o sobrerreaccionar amplificando el rumor es fatal.',
        fixRecommendation:
          'Elaborar una matriz de semáforo de crisis (ignorar, responder jurídicamente o desmentir con datos) con equipo de guardia listo.',
      },
    ],
  },
  {
    id: 'b12',
    number: '12',
    title: 'Rigor presupuestario y tangibilidad',
    subtitle: 'Memoria económica y compromisos de los 100 primeros días',
    iconName: 'coins',
    questions: [
      {
        id: 'q21',
        num: 21,
        text: '¿Están tus propuestas electorales filtradas por su viabilidad económica, competencial y temporal (plan de los 100 primeros días)?',
        detail:
          'El "y yo más" arruina la autoridad moral. El electorado castiga promesas irreales o fuera de las competencias municipales. Se requiere solvencia técnica visible.',
        fixRecommendation:
          'Constituir una comisión de asesoramiento económico municipal para auditar la viabilidad real y el coste de las 10 medidas insignia del programa.',
      },
    ],
  },
];

function getBlockIcon(iconName: string) {
  switch (iconName) {
    case 'target':
      return <Target className="w-5 h-5 text-rose-500" />;
    case 'users':
      return <Users className="w-5 h-5 text-amber-500" />;
    case 'megaphone':
      return <Megaphone className="w-5 h-5 text-blue-500" />;
    case 'scale':
      return <Scale className="w-5 h-5 text-emerald-500" />;
    case 'footprints':
      return <Footprints className="w-5 h-5 text-indigo-500" />;
    case 'calendarCheck':
      return <CalendarCheck className="w-5 h-5 text-red-500" />;
    case 'handshake':
      return <Handshake className="w-5 h-5 text-purple-600" />;
    case 'shield':
      return <Shield className="w-5 h-5 text-teal-600" />;
    case 'messageSquare':
      return <MessageSquare className="w-5 h-5 text-emerald-600" />;
    case 'home':
      return <Home className="w-5 h-5 text-orange-500" />;
    case 'shieldAlert':
      return <ShieldAlert className="w-5 h-5 text-rose-600" />;
    case 'coins':
      return <Coins className="w-5 h-5 text-cyan-600" />;
    default:
      return <Layers className="w-5 h-5 text-slate-500" />;
  }
}

export default function AuditoriaClient({
  campaignId,
  initialMunicipality,
  initialParty,
  initialRole = 'oposicion',
}: {
  campaignId: string;
  initialMunicipality: string;
  initialParty: string;
  initialRole?: string;
}) {
  const [auditMode, setAuditMode] = useState<AuditMode>('21'); // Default to 21 questions mode
  const [activeTab, setActiveTab] = useState<'form' | 'results'>('form');
  const [municipality, setMunicipality] = useState(initialMunicipality);
  const [party, setParty] = useState(initialParty);
  const [role, setRole] = useState(initialRole);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const storageKey = `campana_audit_21_${campaignId}`;

  // Active blocks based on selected mode (21 or 15)
  const activeBlocks = useMemo(() => {
    if (auditMode === '21') {
      return [...BASE_BLOCKS, ...EXTENDED_BLOCKS];
    }
    return BASE_BLOCKS;
  }, [auditMode]);

  const totalQuestions = auditMode === '21' ? 21 : 15;
  const maxPoints = totalQuestions * 2;

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(`campana_audit_15_${campaignId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.mode && (parsed.mode === '21' || parsed.mode === '15')) {
          setAuditMode(parsed.mode);
        }
        if (parsed.municipality) setMunicipality(parsed.municipality);
        if (parsed.party) setParty(parsed.party);
        if (parsed.role) setRole(parsed.role);
      }
    } catch {
      // LocalStorage access fail safe
    }
  }, [storageKey, campaignId]);

  // Save changes to LocalStorage
  const persistData = (
    newAnswers: Record<string, AnswerValue>,
    m = municipality,
    p = party,
    r = role,
    mode = auditMode
  ) => {
    try {
      const payload = {
        answers: newAnswers,
        mode,
        municipality: m,
        party: p,
        role: r,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // fail silently
    }
  };

  const handleSelectAnswer = (qId: string, val: AnswerValue) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qId]: val };
      persistData(updated);
      return updated;
    });
  };

  const handleSwitchMode = (newMode: AuditMode) => {
    setAuditMode(newMode);
    persistData(answers, municipality, party, role, newMode);
    showToast(`Modo cambiado a ${newMode} preguntas (${newMode === '21' ? 'Integral' : 'Esencial'})`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleReset = () => {
    setAnswers({});
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`campana_audit_15_${campaignId}`);
    } catch {}
    showToast('Cuestionario reiniciado correctamente');
    setActiveTab('form');
  };

  const handleFillExample = () => {
    const exampleAnswers: Record<string, AnswerValue> = {};
    activeBlocks.forEach((block) => {
      block.questions.forEach((q, idx) => {
        // Balanced realistic profile
        const val: AnswerValue = idx % 3 === 0 ? 'yes' : idx % 3 === 1 ? 'half' : 'no';
        exampleAnswers[q.id] = val;
      });
    });
    setAnswers((prev) => {
      const updated = { ...prev, ...exampleAnswers };
      persistData(updated);
      return updated;
    });
    showToast(`Completado con datos de demostración (${totalQuestions} preguntas)`);
  };

  // Progress calculations
  const answeredCount = activeBlocks.reduce((acc, block) => {
    return acc + block.questions.filter((q) => answers[q.id]).length;
  }, 0);

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Diagnostic calculations
  const diagnostics = useMemo(() => {
    let yesCount = 0;
    let halfCount = 0;
    let noCount = 0;

    activeBlocks.forEach((block) => {
      block.questions.forEach((q) => {
        const val = answers[q.id];
        if (val === 'yes') yesCount++;
        else if (val === 'half') halfCount++;
        else noCount++;
      });
    });

    const points = yesCount * 2 + halfCount * 1;
    const percentage = Math.round((points / maxPoints) * 100);

    const blockScores = activeBlocks.map((block) => {
      let bYes = 0;
      let bHalf = 0;
      let bNo = 0;

      block.questions.forEach((q) => {
        const v = answers[q.id];
        if (v === 'yes') bYes++;
        else if (v === 'half') bHalf++;
        else bNo++;
      });

      const bPoints = bYes * 2 + bHalf * 1;
      const bMaxPoints = block.questions.length * 2;
      const scorePct = Math.round((bPoints / bMaxPoints) * 100);

      return {
        id: block.id,
        number: block.number,
        title: block.title,
        axisLabel: `B${block.number}: ${block.title.slice(0, 13)}...`,
        yes: bYes,
        half: bHalf,
        no: bNo,
        total: block.questions.length,
        scorePct,
      };
    });

    // Action plan items
    const actionItems: {
      priority: 'critical' | 'urgent';
      badge: string;
      badgeClass: string;
      qNum: number;
      blockTitle: string;
      questionText: string;
      actionText: string;
    }[] = [];

    activeBlocks.forEach((block) => {
      block.questions.forEach((q) => {
        const val = answers[q.id] || 'no';
        if (val === 'no') {
          actionItems.push({
            priority: 'critical',
            badge: 'Prioridad 1 · Bloqueo Crítico',
            badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
            qNum: q.num,
            blockTitle: block.title,
            questionText: q.text,
            actionText: q.fixRecommendation,
          });
        } else if (val === 'half') {
          actionItems.push({
            priority: 'urgent',
            badge: 'Prioridad 2 · Cierre Pendiente',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
            qNum: q.num,
            blockTitle: block.title,
            questionText: q.text,
            actionText: q.fixRecommendation,
          });
        }
      });
    });

    // Verdict determination strictly following the strategic manual
    const criticalThreshold = auditMode === '21' ? 9 : 7;
    const warningThreshold = auditMode === '21' ? 8 : 6;

    let verdictType: 'danger' | 'warning' | 'success' = 'danger';
    let label = 'Riesgo Crítico de Derrota';
    let title = 'Campaña en riesgo alto por falta de rumbo y estructura';
    let description =
      'Faltan elementos esenciales: diagnóstico, prioridades, temas clave, alianzas de gobernabilidad, presencia territorial o preparación interna. Esto significa que o bien no has comenzado a preparar tu campaña o que se está construyendo sin estrategia ni planificación. En ambos casos, estás corriendo un riesgo alto y regalando la iniciativa al adversario.';
    let recommendation =
      'Detener la inercia del día a día, convocar un comité de urgencia y formalizar el mapa de objetivos antes de lanzar cualquier acto público.';

    if (noCount >= criticalThreshold || (noCount > yesCount && noCount > halfCount)) {
      verdictType = 'danger';
      label = 'Riesgo Crítico de Derrota';
      title = 'Campaña en riesgo alto por falta de rumbo y estructura';
      description =
        'Faltan elementos esenciales: diagnóstico, prioridades, temas clave, alianzas de gobernabilidad, presencia territorial o preparación interna. Esto significa que o bien no has comenzado a preparar tu campaña o que se está construyendo sin estrategia ni planificación. En ambos casos, estás corriendo un riesgo alto y regalando la iniciativa al adversario.';
      recommendation =
        'Detener la inercia del día a día, convocar un comité de urgencia y formalizar el mapa de objetivos antes de lanzar cualquier acto público.';
    } else if (halfCount >= warningThreshold || (halfCount >= yesCount && halfCount >= noCount)) {
      verdictType = 'warning';
      label = 'Urgencia de Orden y Cierre';
      title = 'Proyecto en marcha pero sin decisiones cerradas';
      description =
        'El proyecto está en marcha, pero sin un orden claro. Hay aspectos iniciados, decisiones pendientes (pactos, mensaje unificado, canales digitales o calendario) y tareas que avanzan sin una dirección definida. Es preciso meterle tensión a la campaña, salir de la tibieza y acordar ya el mensaje unificado y el reparto de funciones operativas.';
      recommendation =
        'No dejes que los debates internos se eternicen. Es prioritario descartar propuestas accesorias y fijar las fechas de precampaña.';
    } else {
      verdictType = 'success';
      label = 'Estructura Base Construida';
      title = 'Bases sólidas: momento de redactar y ejecutar';
      description =
        'La estructura básica de la campaña está construida. Falta comprobar que todas las piezas apuntan al mismo objetivo sin fisuras. El paso siguiente consiste en poner la estrategia por escrito y empezar a ejecutarla. Periódicamente debes revisar este cuestionario para ajustar lo que no esté funcionando.';
      recommendation =
        'Vigilar la disciplina de mensaje de todos los portavoces de la candidatura para no desviar la atención de los 3 temas prioritarios.';
    }

    return {
      yesCount,
      halfCount,
      noCount,
      points,
      maxPoints,
      percentage,
      totalQuestions,
      blockScores,
      actionItems,
      verdict: {
        type: verdictType,
        label,
        title,
        description,
        recommendation,
      },
    };
  }, [answers, activeBlocks, auditMode, maxPoints, totalQuestions]);

  const handleCopySummary = () => {
    const summary = `AUDITORÍA DE ESTRATEGIA DE CAMPAÑA MUNICIPAL · ${totalQuestions} PREGUNTAS (${auditMode === '21' ? 'MODO INTEGRAL' : 'MODO ESENCIAL'})
Territorio: ${municipality || 'Municipio'}
Candidatura: ${party || 'Candidatura'}
Nivel de Madurez: ${diagnostics.verdict.label} (${diagnostics.percentage}% · ${diagnostics.points}/${diagnostics.maxPoints} pts)
Balance: ${diagnostics.yesCount} Sí | ${diagnostics.halfCount} A medias | ${diagnostics.noCount} No

Desglose de Bloques (${diagnostics.blockScores.length} Ejes):
${diagnostics.blockScores.map((b) => `- Bloque ${b.number} (${b.title}): ${b.scorePct}%`).join('\n')}

Plan de Choque Inmediato: ${diagnostics.actionItems.length} acciones prioritarias identificadas.
Metodología: Auditoría de Estrategia Electoral · Curro Gil & Charo Toscano`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      showToast('Resumen de auditoría copiado al portapapeles');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Sub-navigation and Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-500 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4" /> Diagnóstico Integral · Auditoría Municipal
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              {auditMode === '21' ? 'Modo Integral · 21 Preguntas' : 'Modo Esencial · 15 Preguntas'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Auditoría Estratégica Electoral ({totalQuestions} Preguntas)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Diagnóstico avanzado de 12 dimensiones estratégicas para {municipality}.
          </p>
        </div>

        {/* Tab & Navigation Pills */}
        <div className="flex items-center gap-2 print:hidden">
          <Link
            href="/diagnostico"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 transition"
            title="Ver matriz DAFO territorial"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Matriz DAFO</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'form'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 text-rose-400" />
            <span>Cuestionario ({totalQuestions})</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Informe y Diagnóstico</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50/80 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0">
            {answeredCount}/{totalQuestions}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Progreso: {progressPercent}%
              </span>
              <span className="text-[11px] text-slate-500">
                ({answeredCount} de {totalQuestions} respondidas)
              </span>
            </div>
            <div className="w-48 sm:w-64 bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-rose-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Mode Switcher + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher Pills */}
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchMode('21')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
                auditMode === '21'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>21 Preguntas (Integral)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('15')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
                auditMode === '15'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>15 Preguntas (Esencial)</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {answeredCount > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg border border-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          )}

          <button
            onClick={handleFillExample}
            className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rellenar ejemplo</span>
          </button>

          {activeTab === 'form' ? (
            <button
              onClick={() => setActiveTab('results')}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>Ver Informe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('form')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Respuestas</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW: QUESTIONNAIRE */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          {/* Intro Card & Municipality Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50/80 text-rose-700 border border-rose-200/80 text-xs font-bold uppercase tracking-wider mb-3">
                  <Target className="w-3.5 h-3.5 text-rose-500" /> Diagnóstico de Mitad de Mandato
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {auditMode === '21'
                    ? 'Auditoría Integral de Estrategia Electoral (21 Preguntas)'
                    : 'Auditoría Esencial de Estrategia Electoral (15 Preguntas)'}
                </h2>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {auditMode === '21' ? (
                    <>
                      «Lo que se haga ahora tendrá consecuencias. Lo que no se haga, también.» Evaluación ampliada con <strong>21 preguntas estratégicas</strong> organizadas en 12 dimensiones: diagnóstico de partida, territorio, mensaje, gobernabilidad y alianzas, blindaje de marca local, WhatsApp/conversación privada, nuevos vecinos y juventud, guerra sucia y solvencia presupuestaria.
                    </>
                  ) : (
                    <>
                      «Lo que se haga ahora tendrá consecuencias. Lo que no se haga, también.» Las campañas sin rumbo van derechas al fracaso. Responde con total honestidad a estas 15 preguntas clave agrupadas en 6 bloques temáticos para obtener una <strong>auditoría diagnóstica personalizada con plan de choque inmediato</strong>.
                    </>
                  )}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <strong>Sí (2 pts):</strong> Criterio definido y operativo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PauseCircle className="w-4 h-4 text-amber-500" /> <strong>A medias (1 pt):</strong> Iniciado pero sin cerrar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" /> <strong>No (0 pts):</strong> Vacío o elemento ausente
                  </span>
                </div>
              </div>

              {/* Campaign Identification Form */}
              <div className="w-full lg:w-80 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 shrink-0">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-rose-500" /> Parámetros de Evaluación
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Municipio / Territorio
                    </label>
                    <input
                      type="text"
                      value={municipality}
                      onChange={(e) => {
                        setMunicipality(e.target.value);
                        persistData(answers, e.target.value, party, role);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Candidatura / Partido
                    </label>
                    <input
                      type="text"
                      value={party}
                      onChange={(e) => {
                        setParty(e.target.value);
                        persistData(answers, municipality, e.target.value, role);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Rol en el Ayuntamiento
                    </label>
                    <select
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                        persistData(answers, municipality, party, e.target.value);
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400"
                    >
                      <option value="oposicion">En la oposición (aspira a gobernar)</option>
                      <option value="gobierno">En el gobierno municipal (busca revalidar)</option>
                      <option value="nueva">Nueva candidatura o plataforma ciudadana</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blocks of Questions */}
          <div className="space-y-6">
            {activeBlocks.map((block) => {
              const blockAnswered = block.questions.filter((q) => answers[q.id]).length;
              const isBlockComplete = blockAnswered === block.questions.length;

              return (
                <div
                  key={block.id}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden"
                >
                  {/* Block Header */}
                  <div className="bg-slate-50/80 border-b border-slate-200/80 p-5 flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-800 text-rose-200 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {block.number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                            Bloque {block.number} · {block.questions.length} {block.questions.length > 1 ? 'Preguntas' : 'Pregunta'}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                          {getBlockIcon(block.iconName)}
                          <span>{block.title}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{block.subtitle}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isBlockComplete
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {blockAnswered} / {block.questions.length} respondidas
                      </span>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="divide-y divide-slate-100 p-2 sm:p-4">
                    {block.questions.map((q) => {
                      const selectedVal = answers[q.id];

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl transition ${
                            selectedVal === 'yes'
                              ? 'bg-emerald-50/40'
                              : selectedVal === 'half'
                              ? 'bg-amber-50/40'
                              : selectedVal === 'no'
                              ? 'bg-rose-50/40'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-grow max-w-3xl">
                              <div className="flex items-start gap-2.5">
                                <span className="text-sm font-extrabold text-rose-500 mt-0.5 shrink-0">
                                  {q.num}.
                                </span>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                    {q.text}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {q.detail}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Answer Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                              <button
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, 'yes')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                                  selectedVal === 'yes'
                                    ? 'border-2 border-emerald-400 bg-emerald-50/80 text-emerald-800 shadow-2xs'
                                    : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Sí</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, 'half')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                                  selectedVal === 'half'
                                    ? 'border-2 border-amber-400 bg-amber-50/80 text-amber-800 shadow-2xs'
                                    : 'border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
                                }`}
                              >
                                <PauseCircle className="w-4 h-4 text-amber-500" />
                                <span>A medias</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, 'no')}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                                  selectedVal === 'no'
                                    ? 'border-2 border-rose-400 bg-rose-50/80 text-rose-800 shadow-2xs'
                                    : 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                                }`}
                              >
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span>No</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {answeredCount === totalQuestions ? (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Cuestionario completo ({totalQuestions}/{totalQuestions})
                  </span>
                ) : (
                  `Progreso: ${answeredCount} de ${totalQuestions} respondidas`
                )}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {answeredCount === totalQuestions
                  ? 'Has contestado todas las preguntas. Consulta el informe diagnóstico y plan de choque.'
                  : `Faltan ${totalQuestions - answeredCount} preguntas para un diagnóstico 100% calibrado.`}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleFillExample}
                className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl transition font-medium"
              >
                Rellenar ejemplo
              </button>
              <button
                onClick={() => {
                  setActiveTab('results');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs"
              >
                <span>Generar Diagnóstico Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RESULTS & REPORT */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-5 text-9xl font-bold font-serif pointer-events-none select-none">
              {totalQuestions}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-300 bg-rose-950/50 border border-rose-800/60 px-3 py-1 rounded-full">
                  Auditoría Electoral Concluida · {totalQuestions} Preguntas
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                  Diagnóstico Estratégico: {municipality || 'Municipio'}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  Candidatura: <strong>{party || 'Candidatura'}</strong> · Modo: <strong>{auditMode === '21' ? 'Integral (21 Preguntas)' : 'Esencial (15 Preguntas)'}</strong>
                </p>
              </div>

              {/* Circular Score Gauge */}
              <div className="bg-slate-800/90 border border-slate-700 backdrop-blur rounded-2xl p-4 sm:p-5 flex items-center gap-5 min-w-[260px] shrink-0">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-rose-400"
                      strokeDasharray={`${diagnostics.percentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-white">
                    {diagnostics.percentage}%
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Nivel de Madurez
                  </p>
                  <p className="text-sm font-bold text-white leading-tight">
                    {diagnostics.verdict.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {diagnostics.points} de {diagnostics.maxPoints} pts posibles
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar inside Banner */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-3 justify-between items-center print:hidden">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Fecha de emisión: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Resumen</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('form');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-xs font-bold rounded-lg text-white transition flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modificar Respuestas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div
            className={`rounded-2xl p-6 sm:p-7 border ${
              diagnostics.verdict.type === 'danger'
                ? 'bg-rose-50/80 border-rose-300'
                : diagnostics.verdict.type === 'warning'
                ? 'bg-amber-50/80 border-amber-300'
                : 'bg-emerald-50/80 border-emerald-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shrink-0 ${
                  diagnostics.verdict.type === 'danger'
                    ? 'bg-rose-500'
                    : diagnostics.verdict.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              >
                {diagnostics.verdict.type === 'danger' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : diagnostics.verdict.type === 'warning' ? (
                  <Hourglass className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    diagnostics.verdict.type === 'danger'
                      ? 'text-rose-800'
                      : diagnostics.verdict.type === 'warning'
                      ? 'text-amber-800'
                      : 'text-emerald-800'
                  }`}
                >
                  Diagnóstico Estratégico Central
                </span>
                <h3
                  className={`text-lg sm:text-xl font-bold ${
                    diagnostics.verdict.type === 'danger'
                      ? 'text-rose-950'
                      : diagnostics.verdict.type === 'warning'
                      ? 'text-amber-950'
                      : 'text-emerald-950'
                  }`}
                >
                  {diagnostics.verdict.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    diagnostics.verdict.type === 'danger'
                      ? 'text-rose-900'
                      : diagnostics.verdict.type === 'warning'
                      ? 'text-amber-900'
                      : 'text-emerald-900'
                  }`}
                >
                  {diagnostics.verdict.description}
                </p>
                <div
                  className={`mt-3 p-3 rounded-xl border text-xs font-semibold ${
                    diagnostics.verdict.type === 'danger'
                      ? 'bg-white/90 border-rose-200 text-rose-900'
                      : diagnostics.verdict.type === 'warning'
                      ? 'bg-white/90 border-amber-200 text-amber-900'
                      : 'bg-white/90 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <strong>Recomendación del Manual:</strong> {diagnostics.verdict.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border-t-4 border-emerald-400 rounded-2xl p-5 shadow-xs border-x border-b border-slate-200/90">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Fortalezas Consolidadas
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{diagnostics.yesCount}</span>
                <span className="text-xs text-slate-500">preguntas con «Sí»</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Criterios definidos, contrastados y operativos para la contienda electoral.
              </p>
            </div>

            <div className="bg-white border-t-4 border-amber-400 rounded-2xl p-5 shadow-xs border-x border-b border-slate-200/90">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Temas a medias (Riesgo Latente)
                </span>
                <PauseCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{diagnostics.halfCount}</span>
                <span className="text-xs text-slate-500">preguntas con «A medias»</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Trabajo iniciado pero sin cerrar acuerdos ni decisiones operativas firmes.
              </p>
            </div>

            <div className="bg-white border-t-4 border-rose-400 rounded-2xl p-5 shadow-xs border-x border-b border-slate-200/90">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                  Vacíos Críticos
                </span>
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{diagnostics.noCount}</span>
                <span className="text-xs text-slate-500">preguntas con «No»</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Ausencias estratégicas que comprometen seriamente tus posibilidades de éxito.
              </p>
            </div>
          </div>

          {/* Visual Charts & Block Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Radar Chart */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-base text-slate-900">
                    Equilibrio Estratégico ({diagnostics.blockScores.length} Bloques)
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">% de solidez</span>
                </div>
                <div className="h-64 sm:h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={auditMode === '21' ? '65%' : '72%'} data={diagnostics.blockScores}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="axisLabel"
                        tick={{ fill: '#334155', fontSize: auditMode === '21' ? 9.5 : 11, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                      />
                      <Radar
                        name="Solidez (%)"
                        dataKey="scorePct"
                        stroke="#fb7185"
                        fill="#fda4af"
                        fillOpacity={0.35}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Solidez']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3 border-t border-slate-100 pt-3">
                El perfil de la gráfica debe ser lo más regular y amplio posible. Las puntas bajas indican flancos abiertos para los adversarios.
              </p>
            </div>

            {/* Breakdown List by Block */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-4">
                  Desglose por Ejes Tácticos ({diagnostics.blockScores.length} Dimensiones)
                </h3>
                <div className="space-y-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                  {diagnostics.blockScores.map((b) => {
                    let colorClass = 'bg-rose-400';
                    if (b.scorePct < 40) colorClass = 'bg-rose-400';
                    else if (b.scorePct < 75) colorClass = 'bg-amber-400';
                    else colorClass = 'bg-emerald-400';

                    return (
                      <div key={b.id} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1 font-medium">
                          <span className="text-slate-800 font-bold truncate max-w-[230px] sm:max-w-none">
                            B{b.number}: {b.title}
                          </span>
                          <span className="font-extrabold text-slate-900 shrink-0">
                            {b.scorePct}% ({b.yes} Sí · {b.half} M · {b.no} No)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${colorClass} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${b.scorePct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Puntuación: Sí = 100% · A medias = 50% · No = 0%</span>
              </div>
            </div>
          </div>

          {/* Action Plan (Plan de Choque Inmediato) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  Plan de Choque Inmediato ({diagnostics.actionItems.length} Puntos Identificados)
                </h3>
                <p className="text-xs text-slate-500">
                  Acciones prioritarias clasificadas por nivel de urgencia según tus respuestas
                </p>
              </div>
            </div>

            {diagnostics.actionItems.length === 0 ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-950 text-base">
                  ¡Enhorabuena! Has respondido «Sí» a las {totalQuestions} preguntas
                </h4>
                <p className="text-xs text-emerald-800 mt-1 max-w-lg mx-auto">
                  Tu campaña cuenta con un armazón táctico sobresaliente. Tu tarea ahora es mantener la coherencia diaria, coordinar las visitas vecinales y no perder el foco ante las provocaciones del adversario.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {diagnostics.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white transition flex flex-col sm:flex-row sm:items-start gap-4 shadow-2xs"
                  >
                    <div className="shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        Pregunta {item.qNum} · {item.blockTitle}
                      </p>
                      <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                        {item.questionText}
                      </h5>
                      <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-slate-900">Paso táctico a dar:</strong>{' '}
                          {item.actionText}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Three Pillars of Campaign Victory */}
          <div className="bg-gradient-to-br from-[#1e2533] via-slate-900 to-[#1e2533] text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-[11px] uppercase font-bold tracking-widest text-rose-300">
                Doctrina de Campaña
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Las tres acciones que definen la victoria
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                «Buena parte del trabajo electoral consiste en concentrar los esfuerzos allí donde el proyecto tiene margen y evitar dispersarse en tareas que no aportan nada.»
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur">
                <div className="text-2xl font-extrabold text-rose-400 mb-2">01.</div>
                <h4 className="text-base font-bold text-white mb-1">Ordenar</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Estructura firme frente a la improvisación del día a día. Dejar de funcionar como pollo sin cabeza y unificar el mando bajo una estrategia común.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur">
                <div className="text-2xl font-extrabold text-rose-400 mb-2">02.</div>
                <h4 className="text-base font-bold text-white mb-1">Elegir</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focalizar esfuerzos donde existe verdadero margen de crecimiento electoral: seleccionar los temas con ventaja competitiva y los distritos decisivos.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur">
                <div className="text-2xl font-extrabold text-rose-400 mb-2">03.</div>
                <h4 className="text-base font-bold text-white mb-1">Descartar</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Eliminar actos, reuniones y debates estériles que consumen energías sin mover ni un solo voto. Quien quiere hablar de todo, no dice nada.
                </p>
              </div>
            </div>
          </div>

          {/* Author Card & Consulting Referral */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
                CG
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Curro Gil</h4>
                <p className="text-xs text-rose-500 font-semibold">
                  Consultor en Estrategia Municipal
                </p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-md">
                  Asesoramiento táctico y acompañamiento integral a candidaturas y equipos de gobierno para planificar y ganar elecciones municipales. Metodología basada en Charo Toscano y ampliación de gobernabilidad local.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
              <a
                href="mailto:contacto@currogil.com?subject=Revisi%C3%B3n%20Estrategia%20de%20Campa%C3%B1a"
                className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Contactar para Asesoría</span>
              </a>
              <Link
                href="/diagnostico"
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-center flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Ir a Matriz DAFO</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
