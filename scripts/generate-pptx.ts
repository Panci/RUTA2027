import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

export async function generatePresentationPptx() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Ruta 2027';
  pptx.company = 'Plataforma de Inteligencia Electoral';
  pptx.title = 'Plataforma Elecciones Municipales Mayo 2027';
  pptx.subject = 'Exposición Integral de Funcionalidades y Estrategia Municipal';

  // Define Master Slide Styling
  const THEME = {
    darkBg: '0F172A',      // Slate 900
    cardDark: '1E293B',    // Slate 800
    cardBorder: '334155',  // Slate 700
    white: 'FFFFFF',
    textMain: '0F172A',
    textMuted: '64748B',
    red: 'DC2626',
    emerald: '059669',
    blue: '2563EB',
    amber: 'D97706',
    purple: '7C3AED',
    sky: '0284C7',
    lightBg: 'F8FAFC',
    lightCard: 'F1F5F9',
  };

  // Helper to add header to slide
  const addSlideHeader = (slide: any, category: string, title: string, subtitle: string, catColor: string = THEME.red) => {
    // Top category badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 0.5,
      w: 2.8,
      h: 0.35,
      fill: { color: catColor },
      rectRadius: 0.1,
    });
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.5,
      w: 2.8,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: THEME.white,
      align: 'center',
      valign: 'middle',
    });

    // Title
    slide.addText(title, {
      x: 0.8,
      y: 0.95,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: THEME.textMain,
    });

    // Subtitle
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.5,
      w: 11.5,
      h: 0.4,
      fontSize: 12,
      color: THEME.textMuted,
    });

    // Separator line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.95,
      w: 11.7,
      h: 0,
      line: { color: 'E2E8F0', width: 1.5 },
    });
  };

  // =========================================================================
  // SLIDE 1: PORTADA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: THEME.darkBg };

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.8,
      y: 1.2,
      w: 3.7,
      h: 0.4,
      fill: { color: '1E293B' },
      line: { color: THEME.red, width: 1 },
      rectRadius: 0.2,
    });
    slide.addText('✨ SOFTWARE DE ESTRATEGIA MUNICIPAL', {
      x: 4.8,
      y: 1.2,
      w: 3.7,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: 'FCA5A5',
      align: 'center',
      valign: 'middle',
    });

    slide.addText('Plataforma de Inteligencia y\nEstrategia Electoral', {
      x: 1.0,
      y: 1.8,
      w: 11.3,
      h: 1.5,
      fontSize: 34,
      bold: true,
      color: THEME.white,
      align: 'center',
    });

    slide.addText('Elecciones Municipales Mayo 2027 • De la Intuición a la Precisión Electoral', {
      x: 1.5,
      y: 3.3,
      w: 10.3,
      h: 0.6,
      fontSize: 15,
      color: '94A3B8',
      align: 'center',
    });

    // 4 Key KPI Boxes
    const kpiBoxes = [
      { num: '68', title: 'Municipios de Sevilla', desc: 'Escrutinio LOREG 2023 precargado', color: THEME.red },
      { num: '100%', title: 'Ley D\'Hondt Oficial', desc: 'Doble columna y recálculo vivo', color: THEME.emerald },
      { num: '7 Fases', title: 'Hoja de Ruta 2026-27', desc: 'Hitos y cronograma operativo', color: THEME.blue },
      { num: '6 Roles', title: 'Seguridad RBAC', desc: 'Blindaje de permisos por perfil', color: THEME.purple },
    ];

    kpiBoxes.forEach((b, i) => {
      const xPos = 1.0 + i * 2.85;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.3,
        w: 2.65,
        h: 1.8,
        fill: { color: THEME.cardDark },
        line: { color: THEME.cardBorder, width: 1 },
        rectRadius: 0.15,
      });

      slide.addText(b.num, {
        x: xPos + 0.2,
        y: 4.5,
        w: 2.25,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: b.color,
      });

      slide.addText(b.title, {
        x: xPos + 0.2,
        y: 5.1,
        w: 2.25,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: THEME.white,
      });

      slide.addText(b.desc, {
        x: xPos + 0.2,
        y: 5.45,
        w: 2.25,
        h: 0.5,
        fontSize: 10,
        color: '94A3B8',
      });
    });

    slide.addNotes(
      'Bienvenida a la presentación. Destaca que esta herramienta no es solo un gestor de tareas ni un simple Excel, sino una plataforma militarizada de estrategia electoral local que unifica el análisis de datos matemáticos, la gobernanza semanal y la disciplina de comunicación.'
    );
  }

  // =========================================================================
  // SLIDE 2: EL DESAFÍO MUNICIPAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Diagnóstico de Necesidad', 'El Reto de las Elecciones Municipales', '¿Por qué las campañas locales se pierden en la última milla?', THEME.amber);

    // Left Column: 4 Errores Clásicos
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 2.2,
      w: 5.6,
      h: 4.6,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 1 },
      rectRadius: 0.15,
    });
    slide.addText('⚠️ LOS 4 ERRORES CLÁSICOS DE CAMPAÑA', {
      x: 1.1,
      y: 2.4,
      w: 5.0,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: '9F1239',
    });
    slide.addText(
      [
        { text: '1. Desconocimiento del coste real del concejal:\n', options: { bold: true, color: 'BE123C' } },
        { text: 'No saber cuántos votos exactos separan al partido de la mayoría absoluta o del último escaño disputado.\n\n' },
        { text: '2. Acción dispersa sin foco territorial:\n', options: { bold: true, color: 'BE123C' } },
        { text: 'Gastar tiempo y recursos en zonas ya fidelizadas o electoralmente inalcanzables.\n\n' },
        { text: '3. Discurso reactivo e improvisado:\n', options: { bold: true, color: 'BE123C' } },
        { text: 'Salir a la defensiva ante ataques rivales sin argumentarios preparados ni réplicas ensayadas.\n\n' },
        { text: '4. Descoordinación del comité semanal:\n', options: { bold: true, color: 'BE123C' } },
        { text: 'Reuniones sin actas vinculantes, acuerdos olvidados y bloqueos sin resolver.' },
      ],
      { x: 1.1, y: 2.9, w: 5.0, h: 3.7, fontSize: 10, color: '334155' }
    );

    // Right Column: La Solución Ruta 2027
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 2.2,
      w: 5.6,
      h: 4.6,
      fill: { color: 'ECFDF5' },
      line: { color: 'A7F3D0', width: 1 },
      rectRadius: 0.15,
    });
    slide.addText('🛡️ LA RESPUESTA CIENTÍFICA DE RUTA 2027', {
      x: 7.1,
      y: 2.4,
      w: 5.0,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: '065F46',
    });
    slide.addText(
      [
        { text: '1. Matemática electoral transparente:\n', options: { bold: true, color: '047857' } },
        { text: 'Algoritmo exacto Ley D\'Hondt que indica el cociente de corte y los votos necesarios para crecer.\n\n' },
        { text: '2. Matriz de competitividad territorial:\n', options: { bold: true, color: '047857' } },
        { text: 'Clasificación estratégica de distritos (Fortaleza, Crecimiento, Defensa u Oportunidad).\n\n' },
        { text: '3. Banco de mensajes y radar de rivales:\n', options: { bold: true, color: '047857' } },
        { text: 'Estructura oficial de discurso con réplicas oficiales inmediatas y detección de oportunidades.\n\n' },
        { text: '4. Gobernanza semanal implacable:\n', options: { bold: true, color: '047857' } },
        { text: 'Actas de comité vinculantes, resolución de bloqueos e informe ejecutivo en 4 preguntas.' },
      ],
      { x: 7.1, y: 2.9, w: 5.0, h: 3.7, fontSize: 10, color: '334155' }
    );

    slide.addNotes(
      'Muestra la diferencia entre el voluntarismo desorganizado y una campaña científica y militarizada en la que cada euro y cada hora del candidato están dirigidos a conseguir concejales.'
    );
  }

  // =========================================================================
  // SLIDE 3: ARQUITECTURA GLOBAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Estructura del Sistema', 'Los 4 Bloques Funcionales del Sistema', 'Una arquitectura integral pensada para los ritmos de una campaña real', THEME.blue);

    const blocks = [
      {
        num: '1',
        title: 'Operativa Semanal',
        desc: 'El panel "Esta Semana", la agenda de calle, las visitas vecinales, las actas de comité y el informe ejecutivo imprimible.',
        tags: 'Panel de Mando • Actos y Visitas • Comités • Informe PDF',
        color: THEME.blue,
        bg: 'EFF6FF',
        border: 'BFDBFE',
      },
      {
        num: '2',
        title: 'Diagnóstico y Datos',
        desc: 'Escrutinio oficial 2023, censo, nulos, mapa epistemológico de partidos rivales y análisis distrital mesa a mesa.',
        tags: 'Línea Base 2023 • Partidos y Rivales • Distritos • Censo',
        color: THEME.sky,
        bg: 'F0F9FF',
        border: 'BAE6FD',
      },
      {
        num: '3',
        title: 'Simulación y DAFO',
        desc: 'Simulador Ley D\'Hondt adaptado a los concejales del municipio con doble columna interactiva y matriz DAFO territorial.',
        tags: 'Simulador D\'Hondt • Doble Columna • DAFO • Auditoría 21P',
        color: THEME.red,
        bg: 'FFF1F2',
        border: 'FECDD3',
      },
      {
        num: '4',
        title: 'Estrategia y Mensaje',
        desc: 'Las 3 prioridades políticas irrenunciables, cronograma en 7 fases con hitos, banco de mensajes y radar de competidores.',
        tags: '3 Prioridades • Hoja de Ruta 7 Fases • Mensajes • Radar',
        color: THEME.purple,
        bg: 'FAF5FF',
        border: 'E9D5FF',
      },
    ];

    blocks.forEach((b, i) => {
      const xPos = 0.8 + i * 2.95;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.3,
        w: 2.75,
        h: 4.4,
        fill: { color: b.bg },
        line: { color: b.border, width: 1 },
        rectRadius: 0.15,
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.25,
        y: 2.55,
        w: 0.6,
        h: 0.6,
        fill: { color: b.color },
        rectRadius: 0.1,
      });
      slide.addText(b.num, {
        x: xPos + 0.25,
        y: 2.55,
        w: 0.6,
        h: 0.6,
        fontSize: 14,
        bold: true,
        color: THEME.white,
        align: 'center',
        valign: 'middle',
      });

      slide.addText(b.title, {
        x: xPos + 0.25,
        y: 3.3,
        w: 2.25,
        h: 0.5,
        fontSize: 13,
        bold: true,
        color: THEME.textMain,
      });

      slide.addText(b.desc, {
        x: xPos + 0.25,
        y: 3.85,
        w: 2.25,
        h: 1.8,
        fontSize: 10,
        color: '475569',
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.2,
        y: 5.8,
        w: 2.35,
        h: 0.7,
        fill: { color: THEME.white },
        line: { color: b.border, width: 1 },
        rectRadius: 0.1,
      });
      slide.addText(b.tags, {
        x: xPos + 0.25,
        y: 5.85,
        w: 2.25,
        h: 0.6,
        fontSize: 8.5,
        bold: true,
        color: b.color,
      });
    });

    slide.addNotes(
      'Explica la lógica del menú lateral. Los módulos están ordenados por frecuencia de uso: primero lo que el equipo consulta todos los días (operativa semanal), luego los datos y simulaciones, y finalmente la estrategia a medio y largo plazo.'
    );
  }

  // =========================================================================
  // SLIDE 4: DATOS OFICIALES 68 MUNICIPIOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Base de Datos Oficial', 'Datos Reales: 68 Municipios de Sevilla', 'Escrutinio 2023 importado directamente de actas electorales del Ministerio del Interior', THEME.emerald);

    const pillars = [
      {
        title: '📋 Censo y Participación Exacta',
        desc: 'Cada municipio cuenta con su censo electoral oficial, porcentaje de participación, abstención, votos nulos y votos en blanco registrados en 2023.',
      },
      {
        title: '🏛️ Concejales Calibrados por Ley',
        desc: 'El pleno municipal se calibra automáticamente según la LOREG: 7, 9, 11, 13, 17 o 21 concejales en función de la población empadronada.',
      },
      {
        title: '⚡ Cambio de Municipio Instantáneo',
        desc: 'El selector de cabecera con buscador predictivo conmuta la campaña activa en 1 clic: cambia los partidos, los votos y las simulaciones.',
      },
    ];

    pillars.forEach((p, i) => {
      const xPos = 0.8 + i * 3.95;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.2,
        w: 3.75,
        h: 2.0,
        fill: { color: 'F8FAFC' },
        line: { color: 'E2E8F0', width: 1 },
        rectRadius: 0.15,
      });
      slide.addText(p.title, {
        x: xPos + 0.2,
        y: 2.4,
        w: 3.35,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: THEME.textMain,
      });
      slide.addText(p.desc, {
        x: xPos + 0.2,
        y: 2.85,
        w: 3.35,
        h: 1.2,
        fontSize: 10,
        color: '475569',
      });
    });

    // Bottom Box with Examples
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.5,
      w: 11.65,
      h: 2.2,
      fill: { color: THEME.darkBg },
      rectRadius: 0.15,
    });

    slide.addText('LOCALIDADES PRECARGADAS EN LA PLATAFORMA (HASTA 19.000 HABITANTES):', {
      x: 1.1,
      y: 4.7,
      w: 11.0,
      h: 0.35,
      fontSize: 10.5,
      bold: true,
      color: '34D399',
    });

    slide.addText(
      'Montellano (13 conc.) • Constantina (13 conc.) • Cazalla de la Sierra (11 conc.) • Alanís (9 conc.) • Guadalcanal (11 conc.) • El Ronquillo (9 conc.) • El Pedroso (9 conc.) • El Real de la Jara (9 conc.) • Almadén de la Plata (9 conc.) • Las Navas de la Concepción (9 conc.) • San Nicolás del Puerto (7 conc.) • El Castillo de las Guardas (9 conc.) • El Madroño (7 conc.) ... y toda la provincia menor de 19.000 hab. con resultados completos por partido.',
      {
        x: 1.1,
        y: 5.1,
        w: 11.0,
        h: 1.4,
        fontSize: 10,
        color: 'CBD5E1',
        lineSpacing: 18,
      }
    );

    slide.addNotes(
      'Destaca que la plataforma no utiliza datos ficticios. Se importaron los 68 municipios de Sevilla menores de 10.000 / 19.000 habitantes desde el fichero oficial del Ministerio del Interior.'
    );
  }

  // =========================================================================
  // SLIDE 5: PANEL "ESTA SEMANA"
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Módulo Operativo', 'Panel de Mando: "Esta Semana"', 'La pantalla de aterrizaje diaria para el candidato y el comité', THEME.blue);

    // 3 Cards top
    const cards = [
      { title: '🎯 Objetivo Central', desc: 'Meta irrenunciable de concejales para gobernar en solitario o encabezar gobierno.' },
      { title: '⏳ Cuenta Atrás Mayo 2027', desc: 'Barra de avance cronológico que sitúa al equipo en la fase exacta del calendario.' },
      { title: '✅ Control Total de Tareas', desc: 'Crear, editar, eliminar y cambiar estado (Pendiente, En Curso, Completada).' },
    ];

    cards.forEach((c, i) => {
      const xPos = 0.8 + i * 3.95;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.2,
        w: 3.75,
        h: 1.6,
        fill: { color: 'F8FAFC' },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.12,
      });
      slide.addText(c.title, { x: xPos + 0.2, y: 2.35, w: 3.35, h: 0.35, fontSize: 11, bold: true, color: THEME.textMain });
      slide.addText(c.desc, { x: xPos + 0.2, y: 2.75, w: 3.35, h: 0.9, fontSize: 9.5, color: '475569' });
    });

    // 6 Questions
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.1,
      w: 11.65,
      h: 2.65,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 1 },
      rectRadius: 0.15,
    });
    slide.addText('LAS 6 PREGUNTAS CLAVE QUE EL EQUIPO DEBE RESPONDER CADA LUNES:', {
      x: 1.1,
      y: 4.25,
      w: 11.0,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: '1E40AF',
    });

    const questions = [
      '1. ¿Dónde somos fuertes? (Bastiones)',
      '2. ¿Dónde se decide la elección? (Distrito clave)',
      '3. ¿Qué decimos siempre? (Mensaje central)',
      '4. ¿De qué no hablamos jamás? (Temas a evitar)',
      '5. ¿Qué hace el candidato esta semana?',
      '6. ¿Qué hacen los rivales? (Radar de contraste)',
    ];

    questions.forEach((q, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const qX = 1.1 + col * 3.7;
      const qY = 4.7 + row * 0.95;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: qX,
        y: qY,
        w: 3.5,
        h: 0.75,
        fill: { color: THEME.white },
        line: { color: 'DBEAFE', width: 1 },
        rectRadius: 0.08,
      });
      slide.addText(q, {
        x: qX + 0.15,
        y: qY + 0.1,
        w: 3.2,
        h: 0.55,
        fontSize: 9.5,
        bold: true,
        color: THEME.textMain,
      });
    });

    slide.addNotes(
      'El panel "Esta Semana" es la brújula operativa. Si un voluntario o concejal entra a la sede, debe saber qué toca hacer esta semana sin perderse en discusiones abstractas.'
    );
  }

  // =========================================================================
  // SLIDE 6: ACTOS Y VISITAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Módulo Operativo', 'Actos, Visitas Vecinales y Contacto', 'Planificación territorial con mensaje y público objetivo asignado', THEME.emerald);

    // Left: Types
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15 });
    slide.addText('TIPOLOGÍAS DE ACTIVIDAD REGISTRABLES:', { x: 1.1, y: 2.4, w: 5.0, h: 0.4, fontSize: 11, bold: true, color: THEME.textMain });

    const types = [
      { tag: 'VISIT • Salida a Pie / Visita Vecinal', desc: 'Paseos por barriadas concretas escuchando demandas directas en comercios y plazas.' },
      { tag: 'EVENT • Carpa Informativa / Calle', desc: 'Puntos de contacto directo, reparto de folletos y recogida de firmas vecinales.' },
      { tag: 'MEETING • Reunión Sectorial', desc: 'Encuentros específicos con asociaciones empresariales, agricultores, jóvenes, etc.' },
      { tag: 'MEDIA • Medios y Publicaciones', desc: 'Ruedas de prensa, notas informativas, entrevistas locales y directos en redes.' },
    ];

    types.forEach((t, i) => {
      const yPos = 2.9 + i * 0.95;
      slide.addText(t.tag, { x: 1.1, y: yPos, w: 5.0, h: 0.3, fontSize: 10, bold: true, color: THEME.emerald });
      slide.addText(t.desc, { x: 1.1, y: yPos + 0.28, w: 5.0, h: 0.6, fontSize: 9, color: '64748B' });
    });

    // Right: Detailed Form Card
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'ECFDF5' }, line: { color: 'A7F3D0', width: 1 }, rectRadius: 0.15 });
    slide.addText('FICHA COMPLETA DE CADA ACCIÓN:', { x: 7.1, y: 2.4, w: 5.0, h: 0.4, fontSize: 11, bold: true, color: '065F46' });
    slide.addText(
      [
        { text: '• Distrito y Zona Asignada:\n', options: { bold: true, color: '047857' } },
        { text: 'Asignación geográfica para medir la presencia en cada punto del pueblo.\n\n' },
        { text: '• Prioridad Política Asociada:\n', options: { bold: true, color: '047857' } },
        { text: 'Vinculado a uno de los 3 pilares irrenunciables de campaña.\n\n' },
        { text: '• Público Objetivo Específico:\n', options: { bold: true, color: '047857' } },
        { text: 'Familias jóvenes, pensionistas, comerciantes de barrio, desempleados...\n\n' },
        { text: '• Mensaje Principal a Transmitir:\n', options: { bold: true, color: '047857' } },
        { text: 'El titular obligatorio que todo portavoz debe repetir en ese acto.\n\n' },
        { text: '• Edición y Eliminación Completa (CRUD):\n', options: { bold: true, color: '047857' } },
        { text: 'Modal interactivo para cambiar fechas, corregir textos o suprimir actos.' },
      ],
      { x: 7.1, y: 2.9, w: 5.0, h: 3.7, fontSize: 9.5, color: '334155' }
    );

    slide.addNotes(
      'No se trata de ir a la calle por ir. Cada salida vecinal tiene un objetivo, un público y un mensaje claro para que el candidato o portavoz no improvise.'
    );
  }

  // =========================================================================
  // SLIDE 7: SEGUIMIENTO Y ACTAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Gobernanza de Campaña', 'Seguimiento Semanal y Actas de Comité', 'Gobernanza formal, acuerdos vinculantes y resolución de bloqueos', THEME.purple);

    const steps = [
      { num: '1', title: 'Orden del Día', desc: 'Puntos aprobados previamente para no dispersar el tiempo del comité directivo.' },
      { num: '2', title: 'Decisiones y Acuerdos', desc: 'Compromisos ejecutivos con nombre de responsable y fecha límite de entrega.' },
      { num: '3', title: 'Bloqueos Identificados', desc: 'Retrasos de material, trabas burocráticas o fallos que exigen intervención inmediata.' },
      { num: '4', title: 'Nuevos Riesgos', desc: 'Anuncios del rival, polémicas o cambios que exigen cautela y preparación.' },
    ];

    steps.forEach((s, i) => {
      const xPos = 0.8 + i * 2.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.3, w: 2.75, h: 2.4, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15 });
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos + 0.2, y: 2.5, w: 0.5, h: 0.5, fill: { color: THEME.purple }, rectRadius: 0.1 });
      slide.addText(s.num, { x: xPos + 0.2, y: 2.5, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: THEME.white, align: 'center', valign: 'middle' });
      slide.addText(s.title, { x: xPos + 0.2, y: 3.15, w: 2.35, h: 0.4, fontSize: 11, bold: true, color: THEME.textMain });
      slide.addText(s.desc, { x: xPos + 0.2, y: 3.55, w: 2.35, h: 1.0, fontSize: 9.5, color: '64748B' });
    });

    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5.0, w: 11.65, h: 1.7, fill: { color: 'FAF5FF' }, line: { color: 'E9D5FF', width: 1 }, rectRadius: 0.15 });
    slide.addText('HISTORIAL DIGITAL DE ACTAS PERMANENTE', { x: 1.1, y: 5.15, w: 11.0, h: 0.35, fontSize: 11, bold: true, color: '6B21A8' });
    slide.addText(
      'Todas las actas de comités anteriores quedan archivadas y accesibles. Permite revisar acuerdos de hace meses, auditar cumplimientos y evitar los clásicos "yo creía que tú te encargabas de eso". Dispone de botones para editar el acta o eliminarla si hubo error.',
      { x: 1.1, y: 5.5, w: 11.0, h: 1.0, fontSize: 10, color: '475569' }
    );

    slide.addNotes(
      'Este módulo profesionaliza la dirección de campaña. Elimina las discusiones de "yo creía que tú ibas a hacer esto", dejando por escrito cada acuerdo y cada bloqueo.'
    );
  }

  // =========================================================================
  // SLIDE 8: INFORME EJECUTIVO PDF
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Gobernanza de Campaña', 'Informe Semanal Ejecutivo (PDF)', 'La estructura de las 4 preguntas esenciales lista para imprimir o compartir', THEME.amber);

    const questionsReport = [
      { q: '✓ ¿Qué se hizo?', desc: 'Balance objetivo de los actos celebrados, visitas concluidas, mensajes difundidos y tareas cerradas durante los últimos 7 días.', color: THEME.emerald, bg: 'ECFDF5' },
      { q: '✕ ¿Qué no se hizo?', desc: 'Autocrítica rigurosa de compromisos que quedaron pendientes, identificando los motivos y el plan de recuperación.', color: THEME.red, bg: 'FFF1F2' },
      { q: '👥 ¿Qué hicieron los rivales?', desc: 'Resumen de inteligencia: declaraciones públicas, propuestas, actos de calle y errores cometidos por las demás fuerzas.', color: THEME.blue, bg: 'EFF6FF' },
      { q: '💡 ¿Qué aprendió el equipo?', desc: 'Lecciones tácticas de la semana: qué temas conectaron mejor con los vecinos y qué ajustes de discurso deben aplicarse.', color: THEME.purple, bg: 'FAF5FF' },
    ];

    questionsReport.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xPos = 0.8 + col * 5.95;
      const yPos = 2.2 + row * 2.35;

      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: yPos, w: 5.7, h: 2.15, fill: { color: item.bg }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.15 });
      slide.addText(item.q, { x: xPos + 0.25, y: yPos + 0.2, w: 5.2, h: 0.4, fontSize: 13, bold: true, color: item.color });
      slide.addText(item.desc, { x: xPos + 0.25, y: yPos + 0.7, w: 5.2, h: 1.25, fontSize: 10, color: '334155' });
    });

    slide.addNotes(
      'El informe semanal en PDF es la herramienta perfecta para rendir cuentas al candidato, a la dirección provincial o al comité electoral sin necesidad de enseñar la base de datos completa.'
    );
  }

  // =========================================================================
  // SLIDE 9: RESULTADOS 2023
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Diagnóstico Electoral', 'Escrutinio 2023: Línea Base Oficial', 'Análisis detallado de votos, concejales y participación', THEME.sky);

    const stats = [
      { label: 'CENSO ELECTORAL TOTAL', value: 'Electorado Municipal', desc: 'Población con derecho a voto según censo oficial del INE.' },
      { label: 'PARTICIPACIÓN EFECTIVA', value: 'Votos Válidos', desc: 'Votos a candidaturas que determinan el reparto de concejales.' },
      { label: 'ABSTENCIÓN REGISTRADA', value: 'Bolsa Oculta', desc: 'Votantes que no acudieron: el mayor potencial de crecimiento.' },
      { label: 'VOTOS EN BLANCO Y NULOS', value: 'Voto Crítico', desc: 'Voto de descontento que influye en los porcentajes finales.' },
    ];

    stats.forEach((s, i) => {
      const xPos = 0.8 + i * 2.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.2, w: 2.75, h: 1.9, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.12 });
      slide.addText(s.label, { x: xPos + 0.15, y: 2.35, w: 2.45, h: 0.35, fontSize: 8.5, bold: true, color: THEME.sky });
      slide.addText(s.value, { x: xPos + 0.15, y: 2.7, w: 2.45, h: 0.45, fontSize: 12, bold: true, color: THEME.textMain });
      slide.addText(s.desc, { x: xPos + 0.15, y: 3.15, w: 2.45, h: 0.8, fontSize: 9, color: '64748B' });
    });

    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.4, w: 11.65, h: 2.3, fill: { color: 'F0F9FF' }, line: { color: 'BAE6FD', width: 1 }, rectRadius: 0.15 });
    slide.addText('VALOR ESTRATÉGICO DE LA LÍNEA BASE:', { x: 1.1, y: 4.6, w: 11.0, h: 0.35, fontSize: 11, bold: true, color: '0369A1' });
    slide.addText(
      '• Permite conocer el "suelo" y el "techo" electoral de cada partido en el municipio.\n• Muestra con exactitud a qué distancia quedó cada lista del concejal que perdió o ganó en el último cociente.\n• Identifica si la victoria depende de convencer a votantes de otros partidos o de movilizar a la bolsa de abstención.',
      { x: 1.1, y: 5.0, w: 11.0, h: 1.5, fontSize: 10, color: '334155', lineSpacing: 22 }
    );

    slide.addNotes(
      'Cualquier estrategia seria parte del escrutinio anterior. Conocer la abstención y el voto nulo permite saber si la victoria vendrá de movilizar descontentos o de disputar votantes a los rivales directos.'
    );
  }

  // =========================================================================
  // SLIDE 10: PARTIDOS Y METODOLOGÍA EPISTEMOLÓGICA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Inteligencia Política', 'Mapeo de Candidaturas y Rivales', 'Separación epistemológica rigurosa en 4 niveles de certeza', THEME.purple);

    const levels = [
      { lvl: 'NIVEL 1', title: '📊 Dato Confirmado', desc: 'Escrutinio oficial LOREG 2023, actas de escrutinio general y concejales obtenidos legalmente.', color: '10B981', bg: '064E3B' },
      { lvl: 'NIVEL 2', title: '📢 Información Pública', desc: 'Declaraciones en prensa, notas oficiales, publicaciones en redes y votos en plenos municipales.', color: '60A5FA', bg: '1E3A8A' },
      { lvl: 'NIVEL 3', title: '🧠 Valoración del Equipo', desc: 'Análisis cualitativo interno de fortalezas, debilidades y puntos vulnerables de cada candidatura rival.', color: 'FBBF24', bg: '78350F' },
      { lvl: 'NIVEL 4', title: '🔮 Hipótesis de Trabajo', desc: 'Escenarios de pactos post-electorales 2027, posibles coaliciones de investidura y rupturas.', color: 'C084FC', bg: '581C87' },
    ];

    levels.forEach((l, i) => {
      const xPos = 0.8 + i * 2.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.2, w: 2.75, h: 4.6, fill: { color: THEME.darkBg }, line: { color: THEME.cardBorder, width: 1 }, rectRadius: 0.15 });
      slide.addText(l.lvl, { x: xPos + 0.2, y: 2.4, w: 2.35, h: 0.3, fontSize: 9, bold: true, color: l.color });
      slide.addText(l.title, { x: xPos + 0.2, y: 2.75, w: 2.35, h: 0.5, fontSize: 12, bold: true, color: THEME.white });
      slide.addText(l.desc, { x: xPos + 0.2, y: 3.35, w: 2.35, h: 2.0, fontSize: 10, color: 'CBD5E1' });
    });

    slide.addNotes(
      'Explica la importancia de no confundir un dato comprobado con un rumor o una hipótesis. Esta pantalla evita que el equipo cometa errores de juicio basados en bulos.'
    );
  }

  // =========================================================================
  // SLIDE 11: ANÁLISIS POR DISTRITOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Estrategia Territorial', 'Análisis Territorial por Distritos', 'Matriz de competitividad y brecha frente al primer competidor', THEME.emerald);

    const quadrants = [
      { name: '🏰 FORTALEZA', desc: 'Bastión propio donde la candidatura lidera con solvencia. Estrategia: fidelizar y no desgastar recursos excesivos.' },
      { name: '📈 CRECIMIENTO', desc: 'Zona donde la candidatura supera su media municipal y está cerca del primer puesto. Estrategia: máxima concentración de actos.' },
      { name: '🛡️ DEFENSA', desc: 'Zona con victoria por margen estrecho expuesta al asalto del rival. Estrategia: defensa activa y presencia vecinal.' },
      { name: '🎯 OPORTUNIDAD', desc: 'Zona dominada por rivales con alto descontento y baja participación. Estrategia: activar la abstención con propuestas concretas.' },
    ];

    quadrants.forEach((q, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xPos = 0.8 + col * 5.95;
      const yPos = 2.2 + row * 2.35;

      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: yPos, w: 5.7, h: 2.15, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 }, rectRadius: 0.15 });
      slide.addText(q.name, { x: xPos + 0.25, y: yPos + 0.2, w: 5.2, h: 0.4, fontSize: 13, bold: true, color: '15803D' });
      slide.addText(q.desc, { x: xPos + 0.25, y: yPos + 0.7, w: 5.2, h: 1.25, fontSize: 10, color: '334155' });
    });

    slide.addNotes(
      'En los municipios medianos y grandes, cada barrio vota de forma distinta. Saber dónde eres fuerte y dónde estás a 50 votos de liderar cambia por completo el despliegue del candidato.'
    );
  }

  // =========================================================================
  // SLIDE 12: SIMULADOR D'HONDT
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Simulación Electoral', 'Simulador Electoral con Ley D’Hondt', 'Cálculo matemático exacto con doble columna y proyección en tiempo real', THEME.red);

    const simCards = [
      { title: '🔢 Doble Columna de Votos', desc: 'Mantiene la columna con los votos originales de 2023 junto a la columna interactiva de votos proyectados.' },
      { title: '🔄 Recálculo Bidireccional', desc: 'Al modificar el porcentaje se recalculan los votos; al cambiar los votos se recalcula el porcentaje al instante.' },
      { title: '⚖️ Algoritmo Oficial LOREG', desc: 'Reparto por cocientes sucesivos decrecientes adaptado al número de concejales legales del municipio.' },
    ];

    simCards.forEach((c, i) => {
      const xPos = 0.8 + i * 3.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.2, w: 3.75, h: 1.9, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 }, rectRadius: 0.15 });
      slide.addText(c.title, { x: xPos + 0.2, y: 2.35, w: 3.35, h: 0.35, fontSize: 11, bold: true, color: '9F1239' });
      slide.addText(c.desc, { x: xPos + 0.2, y: 2.75, w: 3.35, h: 1.2, fontSize: 9.5, color: '475569' });
    });

    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.4, w: 11.65, h: 2.3, fill: { color: THEME.darkBg }, rectRadius: 0.15 });
    slide.addText('RESPUESTAS ESTRATÉGICAS QUE APORTA EL SIMULADOR:', { x: 1.1, y: 4.6, w: 11.0, h: 0.35, fontSize: 11, bold: true, color: 'F87171' });
    slide.addText(
      '• ¿Cuántos votos exactos nos faltan para obtener el concejal siguiente?\n• ¿A qué distancia en votos estamos de la mayoría absoluta municipal?\n• ¿Qué ocurre si la participación sube o baja 5 puntos porcentuales?\n• ¿Cómo influye la entrada de una nueva candidatura independiente o la concentración de voto rival?',
      { x: 1.1, y: 5.0, w: 11.0, h: 1.5, fontSize: 10, color: 'E2E8F0', lineSpacing: 22 }
    );

    slide.addNotes(
      'Demuestra en vivo si es posible el simulador. Destaca la doble columna de votos y la Ley D’Hondt sin fallos ni aproximaciones burdas.'
    );
  }

  // =========================================================================
  // SLIDE 13: DAFO Y AUDITORÍA 21 PREGUNTAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Diagnóstico Estratégico', 'Diagnóstico DAFO y Test 21 Preguntas', 'Evaluación continua del estado de salud de la candidatura', THEME.amber);

    // Left: DAFO
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15 });
    slide.addText('MATRIZ DAFO MUNICIPAL Y POR DISTRITOS:', { x: 1.1, y: 2.4, w: 5.0, h: 0.35, fontSize: 11, bold: true, color: THEME.textMain });
    slide.addText(
      '• Fortalezas: Activos contrastados (candidato conocido, gestión demostrada, cohesión).\n• Debilidades: Flancos vulnerables (falta de presencia en barrios, desgaste previo).\n• Oportunidades: Descontento vecinal con el gobierno actual, división en la oposición.\n• Amenazas: Aparición de listas populistas, polémicas comarcales o falta de recursos.',
      { x: 1.1, y: 2.85, w: 5.0, h: 3.7, fontSize: 9.5, color: '475569', lineSpacing: 20 }
    );

    // Right: 21 Questions
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'FFFBEB' }, line: { color: 'FDE68A', width: 1 }, rectRadius: 0.15 });
    slide.addText('AUDITORÍA INTEGRAL DE 21 PREGUNTAS:', { x: 7.1, y: 2.4, w: 5.0, h: 0.35, fontSize: 11, bold: true, color: '92400E' });
    slide.addText(
      'Test estructurado en 12 dimensiones clave:\n1. Candidato y Liderazgo • 2. Mensaje y Relato • 3. Censo y Apoderados • 4. Equipo de Campaña • 5. Redes y Prensa • 6. Programa y Propuestas • 7. Presupuesto y Financiación • 8. Alianzas Vecinales.\n\nGenera un Semáforo Cuantitativo de Madurez que alerta de los puntos ciegos antes de iniciar la campaña oficial.',
      { x: 7.1, y: 2.85, w: 5.0, h: 3.7, fontSize: 9.5, color: '475569', lineSpacing: 18 }
    );

    slide.addNotes(
      'La auditoría de 21 preguntas es el termómetro objetivo. Ningún equipo debería llegar a marzo de 2027 sin haber completado este test de madurez.'
    );
  }

  // =========================================================================
  // SLIDE 14: ESTRATEGIA Y HOJA DE RUTA 7 FASES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Estrategia y Cronograma', 'Estrategia Central y Hoja de Ruta', 'Las 3 prioridades políticas y el cronograma secuencial en 7 fases', THEME.blue);

    // 3 Priorities
    const priorities = [
      { p: 'Prioridad 1', title: 'Pilar Central Irrenunciable', desc: 'El gran tema que define la candidatura (ej: empleo local, limpieza o vivienda).' },
      { p: 'Prioridad 2', title: 'Pilar Social y Vecinal', desc: 'Respuesta contundente a la mayor queja ciudadana detectada en el municipio.' },
      { p: 'Prioridad 3', title: 'Proyecto Emblemático', desc: 'La gran obra o transformación estratégica prevista para la legislatura 2027-2031.' },
    ];

    priorities.forEach((item, i) => {
      const xPos = 0.8 + i * 3.95;
      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.2, w: 3.75, h: 1.8, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.12 });
      slide.addText(item.p.toUpperCase(), { x: xPos + 0.2, y: 2.35, w: 3.35, h: 0.3, fontSize: 9, bold: true, color: THEME.red });
      slide.addText(item.title, { x: xPos + 0.2, y: 2.65, w: 3.35, h: 0.35, fontSize: 11, bold: true, color: THEME.textMain });
      slide.addText(item.desc, { x: xPos + 0.2, y: 3.05, w: 3.35, h: 0.8, fontSize: 9, color: '475569' });
    });

    // 7 Phases Timeline
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 4.3, w: 11.65, h: 2.5, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 }, rectRadius: 0.15 });
    slide.addText('HOJA DE RUTA SECUENCIAL EN 7 FASES (SEPTIEMBRE 2026 – MAYO 2027):', { x: 1.1, y: 4.5, w: 11.0, h: 0.35, fontSize: 10.5, bold: true, color: '1E40AF' });

    const phases = [
      '1. Diagnóstico\nSep-Oct 26',
      '2. Posición\nNov 26',
      '3. Presencia\nDic 26 - Ene 27',
      '4. Activación\nFeb 27',
      '5. Contacto\nMar-Abr 27',
      '6. Campaña\nMay 27 (Oficial)',
      '7. Voto\nDía D (Elección)',
    ];

    phases.forEach((ph, i) => {
      const phX = 1.1 + i * 1.58;
      slide.addShape(pptx.ShapeType.roundRect, { x: phX, y: 4.95, w: 1.48, h: 1.5, fill: { color: i >= 5 ? 'FEE2E2' : THEME.white }, line: { color: i >= 5 ? 'FCA5A5' : 'DBEAFE', width: 1 }, rectRadius: 0.1 });
      slide.addText(ph, { x: phX + 0.05, y: 5.15, w: 1.38, h: 1.1, fontSize: 9, bold: true, color: i >= 5 ? '991B1B' : THEME.textMain, align: 'center' });
    });

    slide.addNotes(
      'Explica la importancia de no quemar etapas. La campaña electoral no empieza en mayo; se gana en las fases de presencia, activación y contacto durante todo el año previo.'
    );
  }

  // =========================================================================
  // SLIDE 15: BANCO DE MENSAJES Y RADAR DE RIVALES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Relato y Comunicación', 'Banco de Mensajes y Radar de Rivales', 'Disciplina comunicativa y seguimiento sistemático de competidores', THEME.red);

    // Left: Banco de Mensajes
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15 });
    slide.addText('BANCO DE MENSAJES Y ARGUMENTARIOS:', { x: 1.1, y: 2.4, w: 5.0, h: 0.35, fontSize: 11, bold: true, color: THEME.red });
    slide.addText(
      '• Mensajes Principales de Campaña: Las ideas fuerza que todos los candidatos y militantes deben repetir siempre.\n\n• Respuestas a Ataques Previsibles: Réplicas oficiales ya redactadas y ensayadas para desmontar críticas en menos de 5 minutos.\n\n• Preguntas Frecuentes (FAQ): Dudas vecinales recurrentes resueltas con rigor.\n\n• Datos Locales Contrastados: Cifras de presupuesto, deuda o inversiones oficiales para argumentar con hechos demostrables.',
      { x: 1.1, y: 2.85, w: 5.0, h: 3.7, fontSize: 9.5, color: '334155', lineSpacing: 18 }
    );

    // Right: Radar de Rivales
    slide.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 2.2, w: 5.6, h: 4.6, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 1 }, rectRadius: 0.15 });
    slide.addText('RADAR DE COMPETIDORES Y CONTRASTE:', { x: 7.1, y: 2.4, w: 5.0, h: 0.35, fontSize: 11, bold: true, color: '1D4ED8' });
    slide.addText(
      '• Clasificación por Tipo: Declaración pública, propuesta electoral, acto de calle, ataque recibido, pacto anunciado o patinazo público.\n\n• Ventana de Oportunidad para Nuestra Candidatura: Cada movimiento rival se analiza para extraer una contra-propuesta constructiva.\n\n• Filtros en Vivo: Filtrado por partido rival o por tipo de suceso con alertas de riesgo.',
      { x: 7.1, y: 2.85, w: 5.0, h: 3.7, fontSize: 9.5, color: '334155', lineSpacing: 18 }
    );

    slide.addNotes(
      'La disciplina de mensaje gana elecciones. Cuando un rival comete un error, el radar de competidores lo registra y el banco de mensajes proporciona inmediatamente la respuesta oficial recomendada.'
    );
  }

  // =========================================================================
  // SLIDE 16: ROLES Y CONCLUSIÓN
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Gobernanza y Conclusiones', 'Seguridad, Roles y Ventaja Competitiva', 'La herramienta definitiva para gobernar en Mayo de 2027', THEME.darkBg);

    const roles = [
      { r: 'DIRECTOR DE CAMPAÑA', desc: 'Control total de edición, creación y borrado (CRUD) en todos los módulos.' },
      { r: 'CANDIDATO / CABEZA DE LISTA', desc: 'Visión ejecutiva de actos, mensajes clave e informes de comités.' },
      { r: 'RESPONSABLE DE COMUNICACIÓN', desc: 'Gestión del banco de mensajes, réplicas a ataques y radar de prensa.' },
      { r: 'LÍDER TERRITORIAL DE DISTRITO', desc: 'Fichas distritales, quejas vecinales y actos a pie de calle.' },
      { r: 'SUPERVISOR GENERAL', desc: 'Observador de actas de comités y auditoría de preparación.' },
      { r: 'ADMINISTRADOR DEL SISTEMA', desc: 'Configuración de censos, partidos y credenciales.' },
    ];

    roles.forEach((item, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const xPos = 0.8 + col * 3.95;
      const yPos = 2.2 + row * 1.5;

      slide.addShape(pptx.ShapeType.roundRect, { x: xPos, y: yPos, w: 3.75, h: 1.35, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.1 });
      slide.addText(item.r, { x: xPos + 0.15, y: yPos + 0.15, w: 3.45, h: 0.3, fontSize: 9, bold: true, color: THEME.red });
      slide.addText(item.desc, { x: xPos + 0.15, y: yPos + 0.45, w: 3.45, h: 0.75, fontSize: 8.5, color: '475569' });
    });

    // Conclusion Banner
    slide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 5.4, w: 11.65, h: 1.5, fill: { color: THEME.red }, rectRadius: 0.15 });
    slide.addText('PREPARADOS PARA GOBERNAR EN MAYO DE 2027', {
      x: 1.0,
      y: 5.55,
      w: 11.25,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: THEME.white,
      align: 'center',
    });
    slide.addText('Datos oficiales contrastados • Algoritmo matemático D\'Hondt exacto • Gobernanza implacable • Relato unificado', {
      x: 1.0,
      y: 6.0,
      w: 11.25,
      h: 0.4,
      fontSize: 11,
      color: 'FEE2E2',
      align: 'center',
    });

    slide.addNotes(
      'Cierre de la presentación. Destaca que la herramienta está 100% operativa, conectada a los datos reales de los 68 municipios, y lista para ser utilizada por el equipo desde hoy mismo.'
    );
  }

  // Save the presentation
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'presentacion_elecciones_m27.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`PowerPoint generated successfully at: ${outputPath}`);

  // Also copy to artifact directory if available
  const artifactDir = 'C:\\Users\\usuario\\.gemini\\antigravity\\brain\\be80b6bf-43d0-42b6-814e-3eb7d0987d5c';
  if (fs.existsSync(artifactDir)) {
    const artifactPath = path.join(artifactDir, 'presentacion_elecciones_m27.pptx');
    fs.copyFileSync(outputPath, artifactPath);
    console.log(`PowerPoint copied to artifact directory at: ${artifactPath}`);
  }

  return outputPath;
}

// Execute if run directly
generatePresentationPptx().catch(console.error);
