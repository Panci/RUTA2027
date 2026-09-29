import * as fs from 'fs';
import * as path from 'path';

const htmlPath = path.join(process.cwd(), 'public', 'presentacion_elecciones_m27.html');

const updatedHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentación Oficial: Plataforma Elecciones Municipales Mayo 2027</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @media print {
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .slide-card { page-break-after: always; box-shadow: none !important; border: 1px solid #ccc !important; min-height: 94vh !important; }
      [data-step] { opacity: 1 !important; transform: none !important; pointer-events: auto !important; }
    }
    .step-item {
      transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">

  <!-- Barra Superior de Control -->
  <header class="no-print border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-50">
    <div class="flex items-center gap-3">
      <span class="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
      <span class="font-extrabold text-sm tracking-tight text-white">Ruta 2027 • Inteligencia Electoral</span>
      <span class="text-xs text-slate-400 hidden sm:inline">| Presentación de Capacidades y Metodología</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Toggle Paso a Paso -->
      <button onclick="toggleStepMode()" id="stepModeBtn" class="px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 text-xs font-bold transition flex items-center gap-1.5" title="Activar/Desactivar aparición secuencial cuadro a cuadro [P]">
        <span>⚡ Cuadro a Cuadro: ON</span>
      </button>

      <button onclick="toggleOverview()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5">
        <span>Índice</span>
        <span id="slideIndicator" class="bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded text-[11px]">1 / 16</span>
      </button>

      <button onclick="toggleNotes()" id="notesBtn" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition">
        Notas [N]
      </button>

      <button onclick="window.print()" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Imprimir / Exportar a PDF">
        🖨️
      </button>

      <button onclick="toggleFullscreen()" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="Pantalla completa [F]">
        ⛶
      </button>
    </div>
  </header>

  <!-- Escenario de Diapositivas -->
  <main class="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl w-full mx-auto">
    <div id="slideContainer" onclick="handleCardClick(event)" class="slide-card w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-12 flex flex-col justify-between min-h-[540px] transition-all duration-200 cursor-pointer" title="Haz clic para avanzar cuadro por cuadro">
      <!-- Se inyecta dinámicamente -->
    </div>

    <!-- Notas del Orador -->
    <div id="notesPanel" class="hidden no-print w-full mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 shadow-lg backdrop-blur">
      <div class="flex items-center justify-between font-bold text-amber-400 uppercase text-[10px] tracking-wider">
        <span>🎙️ Guión y Notas para el Orador</span>
        <button onclick="toggleNotes()" class="text-amber-400 hover:text-white">✕</button>
      </div>
      <p id="notesContent" class="leading-relaxed font-medium text-slate-300"></p>
    </div>
  </main>

  <!-- Barra Inferior de Navegación -->
  <footer class="no-print border-t border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky bottom-0 z-50">
    <button onclick="prevStepOrSlide()" id="prevBtn" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold rounded-xl transition flex items-center gap-2">
      ← <span id="prevBtnText">Anterior</span>
    </button>

    <!-- Indicador de Diapositivas y Pasos -->
    <div class="flex flex-col items-center gap-1.5">
      <div id="dotsContainer" class="flex items-center gap-1.5 overflow-x-auto max-w-md px-2"></div>
      <div id="stepDotsContainer" class="flex items-center gap-1"></div>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="nextSlideDirect()" id="skipBtn" class="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition hidden sm:inline-flex items-center gap-1" title="Saltar a la siguiente diapositiva [Shift + →]">
        <span>Saltar</span> ⏭
      </button>

      <button onclick="nextStepOrSlide()" id="nextBtn" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-900/30">
        <span id="nextBtnText">Siguiente →</span>
      </button>
    </div>
  </footer>

  <!-- Modal Índice de Diapositivas -->
  <div id="overviewModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base">Índice Completo de Diapositivas</h3>
        <button onclick="toggleOverview()" class="text-slate-400 hover:text-white p-1 text-sm font-bold">✕ Cerrar</button>
      </div>
      <div id="overviewGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"></div>
    </div>
  </div>

  <script>
    const slides = [
      {
        id: 1,
        category: "Presentación Oficial",
        categoryColor: "bg-red-600 text-white",
        title: "Plataforma de Inteligencia y Estrategia Electoral",
        subtitle: "Elecciones Municipales Mayo 2027 (Ruta 2027)",
        steps: 5,
        html: \`
          <div class="space-y-6 text-center max-w-3xl mx-auto py-4">
            <div data-step="1" class="step-item space-y-4">
              <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider">
                ✨ Software de Estrategia Municipal
              </div>
              <h2 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                De la Intuición a la <span class="text-red-600">Precisión Electoral</span>
              </h2>
              <p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Plataforma integral diseñada para coordinar equipos de campaña, analizar datos oficiales del Ministerio del Interior, simular mayorías con la Ley D’Hondt y ejecutar la hoja de ruta hacia mayo de 2027.
              </p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-left">
              <div data-step="2" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-2xl font-black text-red-600 block">68</span>
                <span class="text-xs font-bold text-slate-800">Municipios Sevilla</span>
                <span class="text-[10px] text-slate-500 block">Escrutinio 2023</span>
              </div>
              <div data-step="3" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-2xl font-black text-emerald-600 block">100%</span>
                <span class="text-xs font-bold text-slate-800">Ley D'Hondt LOREG</span>
                <span class="text-[10px] text-slate-500 block">Doble columna de voto</span>
              </div>
              <div data-step="4" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-2xl font-black text-blue-600 block">7 Fases</span>
                <span class="text-xs font-bold text-slate-800">Cronograma 2026-27</span>
                <span class="text-[10px] text-slate-500 block">Gestión de hitos</span>
              </div>
              <div data-step="5" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-2xl font-black text-purple-600 block">6 Roles</span>
                <span class="text-xs font-bold text-slate-800">Control RBAC</span>
                <span class="text-[10px] text-slate-500 block">Permisos por perfil</span>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Bienvenida a la presentación. [Paso 2] 68 Municipios de Sevilla. [Paso 3] 100% Ley D'Hondt. [Paso 4] 7 Fases electorales. [Paso 5] 6 Roles RBAC."
      },
      {
        id: 2,
        category: "Diagnóstico de Necesidad",
        categoryColor: "bg-amber-600 text-white",
        title: "El Reto de las Elecciones Municipales",
        subtitle: "¿Por qué las campañas locales se pierden en la última milla?",
        steps: 2,
        html: \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div data-step="1" class="step-item p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <span class="font-bold uppercase text-rose-800 text-xs block">⚠️ 4 Errores Clásicos de Campaña:</span>
              <ul class="space-y-2 text-slate-700 text-[11px]">
                <li>• <strong>Desconocimiento del coste del concejal:</strong> No saber cuántos votos exactos separan al partido de la mayoría absoluta.</li>
                <li>• <strong>Acción dispersa sin foco territorial:</strong> Gastar tiempo en zonas ya fidelizadas o electoralmente perdidas.</li>
                <li>• <strong>Discurso reactivo e improvisado:</strong> Salir a la defensiva sin argumentarios ni réplicas preparadas.</li>
                <li>• <strong>Descoordinación semanal:</strong> Reuniones sin actas vinculantes ni responsables asignados.</li>
              </ul>
            </div>
            <div data-step="2" class="step-item p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <span class="font-bold uppercase text-emerald-800 text-xs block">🛡️ La Respuesta de Ruta 2027:</span>
              <ul class="space-y-2 text-slate-700 text-[11px]">
                <li>✓ <strong>Matemática electoral transparente:</strong> Cálculo exacto del corte de concejales y escenarios de pacto.</li>
                <li>✓ <strong>Matriz de competitividad territorial:</strong> Clasificación de distritos en Fortaleza, Crecimiento, Defensa u Oportunidad.</li>
                <li>✓ <strong>Banco de mensajes y radar de rivales:</strong> Argumentario unificado y monitorización de movimientos del adversario.</li>
                <li>✓ <strong>Gobernanza semanal implacable:</strong> Actas de comités con acuerdos cerrados e informe en 4 preguntas.</li>
              </ul>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Los 4 errores habituales. [Paso 2] Las 4 soluciones que aporta Ruta 2027."
      },
      {
        id: 3,
        category: "Estructura del Sistema",
        categoryColor: "bg-blue-600 text-white",
        title: "Los 4 Bloques Funcionales del Sistema",
        subtitle: "Una arquitectura integral pensada para los ritmos de una campaña real",
        steps: 4,
        html: \`
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div data-step="1" class="step-item p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
              <span class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
              <h4 class="font-bold text-slate-900 text-sm">Operativa Semanal</h4>
              <p class="text-slate-600 text-[11px]">Panel 'Esta Semana', agenda de actos, visitas vecinales e informes de dirección.</p>
            </div>
            <div data-step="2" class="step-item p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
              <span class="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">2</span>
              <h4 class="font-bold text-slate-900 text-sm">Diagnóstico y Datos</h4>
              <p class="text-slate-600 text-[11px]">Escrutinio 2023, censo, mapa de rivales, análisis territorial y test 21 preguntas.</p>
            </div>
            <div data-step="3" class="step-item p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <span class="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs">3</span>
              <h4 class="font-bold text-slate-900 text-sm">Simulador y DAFO</h4>
              <p class="text-slate-600 text-[11px]">Simulador Ley D’Hondt adaptado por municipio, doble columna de voto y matriz DAFO.</p>
            </div>
            <div data-step="4" class="step-item p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
              <span class="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">4</span>
              <h4 class="font-bold text-slate-900 text-sm">Estrategia y Relato</h4>
              <p class="text-slate-600 text-[11px]">3 prioridades irrenunciables, cronograma en 7 fases, banco de mensajes y radar.</p>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Operativa semanal. [Paso 2] Datos y diagnóstico. [Paso 3] Simulador D'Hondt. [Paso 4] Estrategia y relato unificado."
      },
      {
        id: 4,
        category: "Base de Datos",
        categoryColor: "bg-emerald-600 text-white",
        title: "Datos Reales: 68 Municipios de Sevilla",
        subtitle: "Escrutinio 2023 importado de actas oficiales del Ministerio del Interior",
        steps: 4,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div data-step="1" class="step-item p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 text-xs block mb-1">📊 Censo y Participación</span>
                <p class="text-slate-600 text-[11px]">Censo exacto, votos válidos, abstención, nulos y blancos reales de 2023.</p>
              </div>
              <div data-step="2" class="step-item p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 text-xs block mb-1">🏛️ Concejales Oficiales</span>
                <p class="text-slate-600 text-[11px]">Número legal de concejales calibrado según escala LOREG (7, 9, 11, 13, 17...).</p>
              </div>
              <div data-step="3" class="step-item p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 text-xs block mb-1">⚡ Selector Rápido</span>
                <p class="text-slate-600 text-[11px]">Conmutación instantánea entre localidades desde la cabecera en 1 clic.</p>
              </div>
            </div>
            <div data-step="4" class="step-item p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <span class="font-bold text-slate-300 block text-[11px] uppercase tracking-wider">68 Municipios Cargados:</span>
              <div class="flex flex-wrap gap-1.5 text-[10px]">
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Montellano (13)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Alanís (9)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Constantina (13)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Cazalla de la Sierra (11)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Guadalcanal (11)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">El Ronquillo (9)</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">... y 62 más</span>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Censo. [Paso 2] Cuadro Concejales reales. [Paso 3] Cuadro Selector rápido. [Paso 4] Cuadro con los 68 municipios de Sevilla."
      },
      {
        id: 5,
        category: "Módulo Operativo",
        categoryColor: "bg-blue-600 text-white",
        title: "Panel de Mando: 'Esta Semana'",
        subtitle: "La pantalla de aterrizaje diaria para el comité y el candidato",
        steps: 4,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div data-step="1" class="step-item p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                <span class="font-bold text-rose-800 block text-xs mb-1">🎯 Objetivo Central</span>
                <p class="text-slate-700 text-[11px]">Meta fija de concejales para gobernar o liderar coalición.</p>
              </div>
              <div data-step="2" class="step-item p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span class="font-bold text-blue-800 block text-xs mb-1">⏳ Cuenta Atrás 2027</span>
                <p class="text-slate-700 text-[11px]">Barra temporal que sitúa la fase exacta del calendario electoral.</p>
              </div>
              <div data-step="3" class="step-item p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="font-bold text-emerald-800 block text-xs mb-1">✅ Control de Estados</span>
                <p class="text-slate-700 text-[11px]">Conmutación ágil: Pendiente, En Curso y Completada.</p>
              </div>
            </div>
            <div data-step="4" class="step-item p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span class="font-bold text-slate-800 text-xs block">Las 6 Preguntas Clave Semanales:</span>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                <div class="p-2 bg-white rounded border border-slate-200">1. ¿Dónde somos fuertes?</div>
                <div class="p-2 bg-white rounded border border-slate-200">2. ¿Dónde se decide la elección?</div>
                <div class="p-2 bg-white rounded border border-slate-200">3. ¿Qué decimos siempre?</div>
                <div class="p-2 bg-white rounded border border-slate-200">4. ¿De qué no hablamos jamás?</div>
                <div class="p-2 bg-white rounded border border-slate-200">5. ¿Qué hace el candidato hoy?</div>
                <div class="p-2 bg-white rounded border border-slate-200">6. ¿Qué hacen los rivales?</div>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro 1: Objetivo Central. [Paso 2] Cuadro 2: Cuenta Atrás 2027. [Paso 3] Cuadro 3: Control de Estados. [Paso 4] Cuadro 4: Las 6 Preguntas Semanales."
      },
      {
        id: 6,
        category: "Módulo Operativo",
        categoryColor: "bg-emerald-600 text-white",
        title: "Actos, Visitas Vecinales y Contacto",
        subtitle: "Presencia en la calle planificada con rigor y mensaje asignado",
        steps: 4,
        html: \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="space-y-2.5">
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wide">3 Tipologías de Actividad:</h4>
              <div data-step="1" class="step-item p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span class="font-bold text-emerald-800 block text-xs">🚶 Visita Vecinal / Salida a Pie</span>
                <span class="text-slate-600 text-[11px]">Paseos por calles concretas escuchando quejas ciudadanas.</span>
              </div>
              <div data-step="2" class="step-item p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span class="font-bold text-blue-800 block text-xs">🎪 Carpa Informativa / Puesto</span>
                <span class="text-slate-600 text-[11px]">Reparto de material y contacto directo con vecinos.</span>
              </div>
              <div data-step="3" class="step-item p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                <span class="font-bold text-purple-800 block text-xs">🤝 Reunión Sectorial</span>
                <span class="text-slate-600 text-[11px]">Encuentros con comerciantes, agricultores y asociaciones.</span>
              </div>
            </div>
            <div data-step="4" class="step-item p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wide">Ficha de Acción Estratégica:</h4>
              <ul class="space-y-1.5 text-slate-700 text-[11px]">
                <li>• <strong>Distrito Asignado:</strong> Vinculado al peso electoral de la zona.</li>
                <li>• <strong>Prioridad Política:</strong> Uno de los 3 grandes ejes de campaña.</li>
                <li>• <strong>Público Objetivo:</strong> Segmento diana de la visita.</li>
                <li>• <strong>Mensaje Principal:</strong> El titular que el candidato debe fijar.</li>
                <li>• <strong>Gestión Completa:</strong> Crear, editar y eliminar con 1 clic.</li>
              </ul>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Salida a pie. [Paso 2] Cuadro Carpa informativa. [Paso 3] Cuadro Reunión sectorial. [Paso 4] Cuadro Ficha completa de acción."
      },
      {
        id: 7,
        category: "Gobernanza de Campaña",
        categoryColor: "bg-purple-600 text-white",
        title: "Seguimiento Semanal y Actas de Comité",
        subtitle: "Gobernanza formal, acuerdos vinculantes y resolución de bloqueos",
        steps: 5,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div data-step="1" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 block text-xs mb-1">1. Orden del Día</span>
                <p class="text-slate-600 text-[11px]">Puntos fijados previamente.</p>
              </div>
              <div data-step="2" class="step-item p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="font-bold text-emerald-800 block text-xs mb-1">2. Decisiones</span>
                <p class="text-slate-600 text-[11px]">Acuerdos con responsable.</p>
              </div>
              <div data-step="3" class="step-item p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span class="font-bold text-amber-800 block text-xs mb-1">3. Bloqueos</span>
                <p class="text-slate-600 text-[11px]">Frenos que exigen solución.</p>
              </div>
              <div data-step="4" class="step-item p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span class="font-bold text-rose-800 block text-xs mb-1">4. Riesgos</span>
                <p class="text-slate-600 text-[11px]">Amenazas emergentes.</p>
              </div>
            </div>
            <div data-step="5" class="step-item p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h4 class="font-bold text-slate-800 text-xs">Historial Digital de Actas</h4>
                <p class="text-slate-500 text-[11px]">Archivo de todas las reuniones de campaña, editables y auditables.</p>
              </div>
              <span class="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs">
                Actas Vinculantes
              </span>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Orden del Día. [Paso 2] Cuadro Decisiones. [Paso 3] Cuadro Bloqueos. [Paso 4] Cuadro Riesgos. [Paso 5] Cuadro Historial de Actas."
      },
      {
        id: 8,
        category: "Gobernanza de Campaña",
        categoryColor: "bg-amber-600 text-white",
        title: "Informe Semanal Ejecutivo (PDF)",
        subtitle: "La estructura de las 4 preguntas esenciales lista para el candidato",
        steps: 5,
        html: \`
          <div class="space-y-4 text-xs">
            <div data-step="1" class="step-item p-3.5 bg-slate-900 text-white rounded-xl">
              <h4 class="font-bold text-xs text-slate-200 mb-0.5">Formato Ejecutivo de Rendición de Cuentas:</h4>
              <p class="text-slate-400 text-[11px]">Documento limpio y formal listo para imprimir o enviar en PDF al candidato o a la dirección provincial.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div data-step="2" class="step-item p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span class="font-bold text-emerald-800 block text-xs mb-0.5">✓ ¿Qué se hizo?</span>
                <p class="text-slate-700 text-[11px]">Balance de visitas, compromisos y material repartido.</p>
              </div>
              <div data-step="3" class="step-item p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span class="font-bold text-rose-800 block text-xs mb-0.5">✕ ¿Qué no se hizo?</span>
                <p class="text-slate-700 text-[11px]">Autocrítica de tareas demoradas y sus causas.</p>
              </div>
              <div data-step="4" class="step-item p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span class="font-bold text-blue-800 block text-xs mb-0.5">👥 ¿Qué hicieron los rivales?</span>
                <p class="text-slate-700 text-[11px]">Movimientos, errores y declaraciones detectadas.</p>
              </div>
              <div data-step="5" class="step-item p-3 rounded-xl bg-purple-50 border border-purple-200">
                <span class="font-bold text-purple-800 block text-xs mb-0.5">💡 ¿Qué aprendió el equipo?</span>
                <p class="text-slate-700 text-[11px]">Ajustes tácticos para la semana entrante.</p>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Formato Ejecutivo. [Paso 2] Cuadro ¿Qué se hizo? [Paso 3] Cuadro ¿Qué no se hizo? [Paso 4] Cuadro ¿Qué hicieron los rivales? [Paso 5] Cuadro ¿Qué aprendió el equipo?"
      },
      {
        id: 9,
        category: "Diagnóstico Electoral",
        categoryColor: "bg-sky-600 text-white",
        title: "Escrutinio 2023: Línea Base Oficial",
        subtitle: "Análisis detallado de votos, concejales y participación",
        steps: 5,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div data-step="1" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500 block text-[10px]">Censo</span>
                <span class="font-black text-slate-800 text-sm">Padrón Electoral</span>
              </div>
              <div data-step="2" class="step-item p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="text-emerald-700 block text-[10px]">Participación</span>
                <span class="font-black text-emerald-800 text-sm">Votos Válidos</span>
              </div>
              <div data-step="3" class="step-item p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span class="text-amber-700 block text-[10px]">Abstención</span>
                <span class="font-black text-amber-800 text-sm">Bolsa de Voto</span>
              </div>
              <div data-step="4" class="step-item p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span class="text-rose-700 block text-[10px]">Nulos / Blancos</span>
                <span class="font-black text-rose-800 text-sm">Voto de Castigo</span>
              </div>
            </div>
            <div data-step="5" class="step-item p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
              <h4 class="font-bold text-slate-800 text-xs">Conclusiones de la Línea Base:</h4>
              <ul class="space-y-1 text-slate-600 text-[11px]">
                <li>• <strong>Distribución del Pleno:</strong> Concejales logrados y margen del alcalde actual.</li>
                <li>• <strong>Correlación de Fuerzas:</strong> Porcentaje real obtenido en las últimas urnas.</li>
                <li>• <strong>Potencial de Crecimiento:</strong> Número exacto de votantes abstencionistas a movilizar.</li>
              </ul>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Censo. [Paso 2] Cuadro Participación. [Paso 3] Cuadro Abstención. [Paso 4] Cuadro Nulos/Blancos. [Paso 5] Cuadro Conclusiones de línea base."
      },
      {
        id: 10,
        category: "Inteligencia Política",
        categoryColor: "bg-indigo-600 text-white",
        title: "Mapeo de Candidaturas y Rivales",
        subtitle: "Separación rigurosa en 4 niveles de conocimiento político",
        steps: 4,
        html: \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
              <span class="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block">Niveles 1 y 2: Datos Comprobados</span>
              <div data-step="1" class="step-item p-2.5 rounded bg-slate-800 border border-slate-700">
                <strong class="text-emerald-400 text-xs block">1. Dato Oficial</strong>
                <span class="text-slate-300 text-[11px]">Escrutinio 2023, actas y concejales LOREG.</span>
              </div>
              <div data-step="2" class="step-item p-2.5 rounded bg-slate-800 border border-slate-700">
                <strong class="text-blue-400 text-xs block">2. Información Pública</strong>
                <span class="text-slate-300 text-[11px]">Declaraciones de prensa, plenos y listas.</span>
              </div>
            </div>
            <div class="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
              <span class="text-purple-400 font-bold uppercase text-[10px] tracking-wider block">Niveles 3 y 4: Análisis Estratégico</span>
              <div data-step="3" class="step-item p-2.5 rounded bg-slate-800 border border-slate-700">
                <strong class="text-amber-400 text-xs block">3. Valoración de Equipo</strong>
                <span class="text-slate-300 text-[11px]">Fortalezas y flaquezas del candidato rival.</span>
              </div>
              <div data-step="4" class="step-item p-2.5 rounded bg-slate-800 border border-slate-700">
                <strong class="text-purple-400 text-xs block">4. Hipótesis de Pacto</strong>
                <span class="text-slate-300 text-[11px]">Escenarios de coalición para 2027.</span>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Nivel 1: Dato Oficial. [Paso 2] Nivel 2: Información Pública. [Paso 3] Nivel 3: Valoración de Equipo. [Paso 4] Nivel 4: Hipótesis de Pacto."
      },
      {
        id: 11,
        category: "Estrategia Territorial",
        categoryColor: "bg-teal-600 text-white",
        title: "Análisis Territorial por Distritos",
        subtitle: "Matriz de competitividad y brecha frente al primer rival",
        steps: 3,
        html: \`
          <div class="space-y-4 text-xs">
            <div data-step="1" class="step-item p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Cuadrante Territorial de Campaña:</h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div class="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">🏰 Fortaleza (Bastión)</div>
                <div class="p-2 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">📈 Crecimiento (Potencial)</div>
                <div class="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">🛡️ Defensa (Margen fino)</div>
                <div class="p-2 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">🎯 Oportunidad (Descontento)</div>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div data-step="2" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 text-xs block mb-0.5">📊 Comparativa vs Media</span>
                <p class="text-slate-600 text-[11px]">Indica si la lista está por encima o por debajo de su media municipal en esa barriada.</p>
              </div>
              <div data-step="3" class="step-item p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-bold text-slate-800 text-xs block mb-0.5">⚡ Brecha en Votos</span>
                <p class="text-slate-600 text-[11px]">Número exacto de votos de distancia con la primera fuerza local.</p>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro 1: Los 4 cuadrantes. [Paso 2] Cuadro 2: Comparativa vs Media. [Paso 3] Cuadro 3: Brecha en Votos con el rival."
      },
      {
        id: 12,
        category: "Simulación Electoral",
        categoryColor: "bg-rose-600 text-white",
        title: "Simulador Electoral con Ley D’Hondt",
        subtitle: "Cálculo matemático exacto con doble columna y proyección en tiempo real",
        steps: 4,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div data-step="1" class="step-item p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span class="font-bold text-rose-800 block text-xs mb-0.5">🔢 Doble Columna</span>
                <p class="text-slate-700 text-[11px]">Mantiene los votos originales 2023 junto a los nuevos votos proyectados.</p>
              </div>
              <div data-step="2" class="step-item p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="font-bold text-emerald-800 block text-xs mb-0.5">🔄 Recálculo en Vivo</span>
                <p class="text-slate-700 text-[11px]">Al mover porcentaje o votos, todo el pleno se recalcula al instante.</p>
              </div>
              <div data-step="3" class="step-item p-3 bg-blue-50 rounded-xl border border-blue-200">
                <span class="font-bold text-blue-800 block text-xs mb-0.5">⚖️ Ley D'Hondt LOREG</span>
                <p class="text-slate-700 text-[11px]">Reparto riguroso por cocientes decrecientes adaptado a cada localidad.</p>
              </div>
            </div>
            <div data-step="4" class="step-item p-4 bg-slate-900 text-white rounded-xl space-y-1.5">
              <h4 class="font-bold text-xs text-slate-200">Preguntas que Responde el Simulador:</h4>
              <ul class="space-y-1 text-slate-300 text-[11px]">
                <li>• ¿Cuántos votos exactos faltan para conseguir el concejal decisivo?</li>
                <li>• ¿A qué distancia matemática está la mayoría absoluta (la mitad + 1)?</li>
                <li>• ¿Qué ocurre si la participación sube o baja un 5%?</li>
              </ul>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Doble Columna. [Paso 2] Cuadro Recálculo en Vivo. [Paso 3] Cuadro Ley D'Hondt LOREG. [Paso 4] Cuadro Preguntas Clave del Simulador."
      },
      {
        id: 13,
        category: "Diagnóstico Estratégico",
        categoryColor: "bg-orange-600 text-white",
        title: "Diagnóstico DAFO y Auditoría 21 Preguntas",
        subtitle: "Evaluación continua del estado de salud de la candidatura",
        steps: 2,
        html: \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div data-step="1" class="step-item p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Matriz DAFO Territorial</h4>
              <div class="grid grid-cols-2 gap-2 text-[10px]">
                <div class="p-2 bg-emerald-50 rounded border border-emerald-200"><strong class="text-emerald-800 block">Fortalezas</strong>Activos propios</div>
                <div class="p-2 bg-rose-50 rounded border border-rose-200"><strong class="text-rose-800 block">Debilidades</strong>Carencias a corregir</div>
                <div class="p-2 bg-blue-50 rounded border border-blue-200"><strong class="text-blue-800 block">Oportunidades</strong>Huecos electorales</div>
                <div class="p-2 bg-amber-50 rounded border border-amber-200"><strong class="text-amber-800 block">Amenazas</strong>Ataques del rival</div>
              </div>
            </div>
            <div data-step="2" class="step-item p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Auditoría de 21 Preguntas</h4>
              <p class="text-slate-600 text-[11px]">Test en 12 áreas críticas de campaña: candidato, relato, censo, finanzas y movilización.</p>
              <div class="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                <strong>Semáforo de Madurez:</strong> Índice porcentual que alerta antes de la campaña oficial.
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Matriz DAFO. [Paso 2] Cuadro Auditoría 21 Preguntas."
      },
      {
        id: 14,
        category: "Estrategia y Cronograma",
        categoryColor: "bg-blue-600 text-white",
        title: "Estrategia Central y Hoja de Ruta",
        subtitle: "Las 3 prioridades políticas y el cronograma de 7 fases",
        steps: 4,
        html: \`
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div data-step="1" class="step-item p-3 bg-red-50 rounded-xl border border-red-200">
                <span class="font-black text-red-700 text-xs block">Prioridad 1</span>
                <strong class="text-slate-800 text-xs block">Pilar Irrenunciable</strong>
                <span class="text-slate-600 text-[11px]">El gran lema que define la candidatura.</span>
              </div>
              <div data-step="2" class="step-item p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span class="font-black text-amber-700 text-xs block">Prioridad 2</span>
                <strong class="text-slate-800 text-xs block">Pilar Social/Económico</strong>
                <span class="text-slate-600 text-[11px]">Respuesta a la mayor queja vecinal.</span>
              </div>
              <div data-step="3" class="step-item p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span class="font-black text-emerald-700 text-xs block">Prioridad 3</span>
                <strong class="text-slate-800 text-xs block">Pilar de Futuro</strong>
                <span class="text-slate-600 text-[11px]">Proyecto emblemático de gobierno.</span>
              </div>
            </div>
            <div data-step="4" class="step-item p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Cronograma en 7 Fases Hacia Mayo 2027:</h4>
              <div class="grid grid-cols-2 sm:grid-cols-7 gap-1 text-center text-[10px] font-bold">
                <span class="p-1.5 bg-white border border-slate-200 rounded">1. Diagnóstico</span>
                <span class="p-1.5 bg-white border border-slate-200 rounded">2. Posición</span>
                <span class="p-1.5 bg-white border border-slate-200 rounded">3. Presencia</span>
                <span class="p-1.5 bg-white border border-slate-200 rounded">4. Activación</span>
                <span class="p-1.5 bg-white border border-slate-200 rounded">5. Contacto</span>
                <span class="p-1.5 bg-red-100 border border-red-300 rounded text-red-800">6. Campaña</span>
                <span class="p-1.5 bg-emerald-100 border border-emerald-300 rounded text-emerald-800">7. Voto</span>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Prioridad 1. [Paso 2] Cuadro Prioridad 2. [Paso 3] Cuadro Prioridad 3. [Paso 4] Cuadro Cronograma 7 Fases."
      },
      {
        id: 15,
        category: "Relato y Comunicación",
        categoryColor: "bg-red-600 text-white",
        title: "Banco de Mensajes y Radar de Rivales",
        subtitle: "Disciplina comunicativa y seguimiento de competidores",
        steps: 2,
        html: \`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div data-step="1" class="step-item p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Banco de Mensajes Unificado</h4>
              <p class="text-slate-600 text-[11px]">Estructura para que toda la candidatura transmita el mismo mensaje:</p>
              <div class="space-y-1 text-[11px]">
                <div class="p-1.5 rounded bg-red-50 text-red-800 font-semibold">• Tesis Principal de Campaña</div>
                <div class="p-1.5 rounded bg-rose-50 text-rose-800 font-semibold">• Respuestas a Ataques del Rival</div>
                <div class="p-1.5 rounded bg-blue-50 text-blue-800 font-semibold">• Argumentos y Preguntas Frecuentes</div>
              </div>
            </div>
            <div data-step="2" class="step-item p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 text-xs">Radar de Rivales</h4>
              <p class="text-slate-600 text-[11px]">Seguimiento diario de los movimientos de otras candidaturas:</p>
              <div class="space-y-1 text-[11px]">
                <div class="p-1.5 rounded bg-slate-50 text-slate-700"><strong>Registro:</strong> Declaraciones, actos, errores o cambios de lista.</div>
                <div class="p-1.5 rounded bg-emerald-50 text-emerald-800 font-semibold"><strong>Diferenciación:</strong> Cómo convertir el error del rival en propuesta propia.</div>
              </div>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Banco de Mensajes. [Paso 2] Cuadro Radar de Rivales."
      },
      {
        id: 16,
        category: "Gobernanza y Conclusiones",
        categoryColor: "bg-slate-900 text-white",
        title: "Seguridad, Roles y Ventaja Competitiva",
        subtitle: "La herramienta definitiva para gobernar en Mayo de 2027",
        steps: 2,
        html: \`
          <div class="space-y-4 text-xs">
            <div data-step="1" class="step-item p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h4 class="font-bold text-slate-800 text-xs">Control de Acceso RBAC (6 Roles):</h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Director:</strong> Control total</div>
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Candidato:</strong> Agenda y visión</div>
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Comunicación:</strong> Mensajes</div>
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Territorial:</strong> Distrito</div>
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Supervisor:</strong> Comités</div>
                <div class="p-1.5 bg-white rounded border border-slate-200"><strong>Admin:</strong> Global</div>
              </div>
            </div>
            <div data-step="2" class="step-item p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-center space-y-2 shadow-sm">
              <h3 class="text-xl sm:text-2xl font-black">Lista para Ganar en Mayo de 2027</h3>
              <p class="text-xs text-red-100 max-w-xl mx-auto">
                Datos matemáticos rigurosos, gobernanza semanal sin fisuras y relato político unificado en los 68 municipios de Sevilla.
              </p>
            </div>
          </div>
        \`,
        notes: "[Paso 1] Cuadro Roles RBAC. [Paso 2] Cuadro Conclusión final."
      }
    ];

    let currentIdx = 0;
    let currentStep = 1;
    let stepByStepMode = true;
    let isNotesOpen = false;

    function renderSlide() {
      const slide = slides[currentIdx];
      const container = document.getElementById('slideContainer');

      container.innerHTML = \`
        <div class="border-b border-slate-100 pb-4 mb-4">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full \${slide.categoryColor}">
                \${slide.category}
              </span>
              \${stepByStepMode && slide.steps > 1 ? \`
                <span class="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                  Cuadro <span id="currentStepNumber">\${currentStep}</span> de \${slide.steps}
                </span>
              \` : ''}
            </div>
            <div class="flex items-center gap-3 text-xs font-bold text-slate-400">
              \${stepByStepMode && currentStep < slide.steps ? \`
                <button onclick="revealAllSteps(event)" class="text-[11px] text-slate-500 hover:text-red-600 transition flex items-center gap-1 font-semibold" title="Mostrar todos los cuadros [R]">
                  <span>Mostrar todos [R]</span>
                </button>
              \` : ''}
              <span>Diapositiva \${slide.id} de \${slides.length}</span>
            </div>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">\${slide.title}</h2>
          <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">\${slide.subtitle}</p>
        </div>

        <div class="flex-1 flex flex-col justify-center py-2">
          \${slide.html}
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Ruta 2027 • Inteligencia Electoral Municipal</span>
          <span class="hidden sm:inline">Espacio / Clic para avanzar cuadro por cuadro</span>
          <span>Sevilla 2027</span>
        </div>
      \`;

      document.getElementById('slideIndicator').innerText = \`\${slide.id} / \${slides.length}\`;
      document.getElementById('notesContent').innerText = slide.notes;

      updateButtonLabels();
      updateStepsVisibility();
      renderDots();
    }

    function updateStepsVisibility() {
      const slide = slides[currentIdx];
      const stepItems = document.querySelectorAll('#slideContainer [data-step]');
      stepItems.forEach(el => {
        const step = parseInt(el.getAttribute('data-step') || '1', 10);
        if (!stepByStepMode || step <= currentStep) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.pointerEvents = 'auto';
        } else {
          el.style.opacity = '0';
          el.style.transform = 'translateY(16px)';
          el.style.pointerEvents = 'none';
        }
      });

      const stepNum = document.getElementById('currentStepNumber');
      if (stepNum) stepNum.innerText = currentStep;

      updateButtonLabels();
    }

    function updateButtonLabels() {
      const slide = slides[currentIdx];
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const prevText = document.getElementById('prevBtnText');
      const nextText = document.getElementById('nextBtnText');

      prevBtn.disabled = currentIdx === 0 && currentStep === 1;
      nextBtn.disabled = currentIdx === slides.length - 1 && currentStep === slide.steps;

      if (stepByStepMode && currentStep > 1) {
        prevText.innerText = 'Cuadro Anterior';
      } else {
        prevText.innerText = 'Anterior';
      }

      if (stepByStepMode && currentStep < slide.steps) {
        nextText.innerText = \`Siguiente cuadro (\${currentStep}/\${slide.steps}) →\`;
      } else {
        nextText.innerText = 'Siguiente →';
      }

      // Step mini dots
      const stepDots = document.getElementById('stepDotsContainer');
      if (stepByStepMode && slide.steps > 1) {
        stepDots.innerHTML = Array.from({ length: slide.steps }).map((_, idx) => \`
          <span class="h-1.5 rounded-full transition-all \${idx + 1 <= currentStep ? 'w-3.5 bg-red-500' : 'w-1.5 bg-slate-700'}"></span>
        \`).join('');
      } else {
        stepDots.innerHTML = '';
      }
    }

    function nextStepOrSlide() {
      const slide = slides[currentIdx];
      if (stepByStepMode && currentStep < slide.steps) {
        currentStep++;
        updateStepsVisibility();
      } else if (currentIdx < slides.length - 1) {
        currentIdx++;
        currentStep = 1;
        renderSlide();
      }
    }

    function prevStepOrSlide() {
      if (stepByStepMode && currentStep > 1) {
        currentStep--;
        updateStepsVisibility();
      } else if (currentIdx > 0) {
        currentIdx--;
        currentStep = slides[currentIdx].steps || 1;
        renderSlide();
      }
    }

    function nextSlideDirect() {
      if (currentIdx < slides.length - 1) {
        currentIdx++;
        currentStep = 1;
        renderSlide();
      }
    }

    function prevSlideDirect() {
      if (currentIdx > 0) {
        currentIdx--;
        currentStep = 1;
        renderSlide();
      }
    }

    function revealAllSteps(e) {
      if (e) e.stopPropagation();
      currentStep = slides[currentIdx].steps;
      updateStepsVisibility();
    }

    function toggleStepMode() {
      stepByStepMode = !stepByStepMode;
      const btn = document.getElementById('stepModeBtn');
      if (stepByStepMode) {
        btn.innerHTML = '<span>⚡ Cuadro a Cuadro: ON</span>';
        btn.className = 'px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 text-xs font-bold transition flex items-center gap-1.5';
      } else {
        btn.innerHTML = '<span>⚡ Cuadro a Cuadro: OFF</span>';
        btn.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold transition flex items-center gap-1.5';
      }
      updateStepsVisibility();
    }

    function handleCardClick(e) {
      const target = e.target;
      if (target.closest('button') || target.closest('a')) return;
      nextStepOrSlide();
    }

    function renderDots() {
      const container = document.getElementById('dotsContainer');
      container.innerHTML = slides.map((s, idx) => \`
        <button onclick="goToSlide(\${idx})" class="h-2 rounded-full transition-all \${idx === currentIdx ? 'w-6 bg-red-600' : 'w-2 bg-slate-700 hover:bg-slate-500'}" title="Ir a diapositiva \${s.id}"></button>
      \`).join('');
    }

    function goToSlide(idx) {
      currentIdx = idx;
      currentStep = 1;
      renderSlide();
      document.getElementById('overviewModal').classList.add('hidden');
    }

    function toggleNotes() {
      isNotesOpen = !isNotesOpen;
      const panel = document.getElementById('notesPanel');
      const btn = document.getElementById('notesBtn');
      if (isNotesOpen) {
        panel.classList.remove('hidden');
        btn.classList.add('bg-amber-500', 'text-slate-950');
      } else {
        panel.classList.add('hidden');
        btn.classList.remove('bg-amber-500', 'text-slate-950');
      }
    }

    function toggleOverview() {
      const modal = document.getElementById('overviewModal');
      modal.classList.toggle('hidden');
      if (!modal.classList.contains('hidden')) {
        const grid = document.getElementById('overviewGrid');
        grid.innerHTML = slides.map((s, idx) => \`
          <button onclick="goToSlide(\${idx})" class="p-3 rounded-xl text-left border transition \${idx === currentIdx ? 'bg-red-600/20 border-red-500 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Diapositiva \${s.id}</span>
              <span class="uppercase text-red-400">\${s.category.slice(0, 15)}</span>
            </div>
            <h4 class="font-bold line-clamp-1 text-xs text-white">\${s.title}</h4>
            <p class="text-[11px] text-slate-400 line-clamp-2 mt-0.5">\${s.subtitle}</p>
          </button>
        \`).join('');
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    // Atajos de teclado
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) nextSlideDirect();
        else nextStepOrSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        if (e.shiftKey) prevSlideDirect();
        else prevStepOrSlide();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        nextSlideDirect();
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        prevSlideDirect();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        revealAllSteps();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleStepMode();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        toggleNotes();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleOverview();
      }
    });

    // Iniciar primera diapositiva
    renderSlide();
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, updatedHtml, 'utf8');

// Also copy to artifact
const artifactHtmlPath = path.join(
  'C:\\\\Users\\\\usuario\\\\.gemini\\\\antigravity\\\\brain\\\\be80b6bf-43d0-42b6-814e-3eb7d0987d5c',
  'presentacion_elecciones_m27.html'
);
fs.writeFileSync(artifactHtmlPath, updatedHtml, 'utf8');

console.log('Successfully updated standalone HTML presentation with granular card-by-card steps!');
