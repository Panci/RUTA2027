import * as fs from 'fs';
import * as path from 'path';

// Let's create the code for PresentacionClient.tsx with granular card-by-card steps
const presentacionClientCode = `'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Grid,
  CheckCircle2,
  Home,
  Printer,
  Compass,
  FileSpreadsheet,
  Download,
  FileDown,
  X,
  Layers,
  Sparkles,
  Award,
  ShieldCheck,
  MessageSquareQuote,
  Eye,
  SkipForward,
} from 'lucide-react';

interface Slide {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  subtitle: string;
  steps: number;
  content: React.ReactNode;
  speakerNotes: string;
}

export default function PresentacionClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepByStepMode, setStepByStepMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  // Helper component for sequential reveal animations
  const Reveal = ({
    step,
    children,
    className = '',
  }: {
    step: number;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isRevealed = !stepByStepMode || currentStep >= step;
    const isCurrent = stepByStepMode && currentStep === step;

    return (
      <div
        className={\`transition-all duration-500 ease-out transform \${
          isRevealed
            ? 'opacity-100 translate-y-0 filter-none'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } \${
          isCurrent ? 'ring-2 ring-red-500/35 rounded-2xl shadow-md' : ''
        } \${className} print:opacity-100! print:translate-y-0! print:pointer-events-auto! print:ring-0!\`}
      >
        {children}
      </div>
    );
  };

  const slides: Slide[] = [
    // 1. Portada (5 pasos: Intro + 4 métricas una a una)
    {
      id: 1,
      category: 'Presentación Oficial',
      categoryColor: 'bg-red-600 text-white',
      title: 'Plataforma de Inteligencia y Estrategia Electoral',
      subtitle: 'Elecciones Municipales Mayo 2027 (Ruta 2027)',
      steps: 5,
      content: (
        <div className="space-y-6 text-center max-w-4xl mx-auto py-4">
          <Reveal step={1}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-bold tracking-wide uppercase shadow-xs">
                <Sparkles className="w-4 h-4 text-red-600" />
                Software Estratégico Municipal
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                De la Intuición a la <span className="text-red-600">Precisión Electoral</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Plataforma integral diseñada para coordinar equipos de campaña, analizar datos oficiales del Ministerio del Interior, simular mayorías con la Ley D’Hondt y ejecutar la hoja de ruta hacia mayo de 2027.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
            <Reveal step={2}>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <span className="text-2xl font-black text-red-600 block">68</span>
                <span className="text-xs font-bold text-slate-700 block">Municipios de Sevilla</span>
                <span className="text-[11px] text-slate-500">Escrutinio oficial 2023</span>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <span className="text-2xl font-black text-emerald-600 block">100%</span>
                <span className="text-xs font-bold text-slate-700 block">Ley D'Hondt LOREG</span>
                <span className="text-[11px] text-slate-500">Simulador con doble columna</span>
              </div>
            </Reveal>
            <Reveal step={4}>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <span className="text-2xl font-black text-blue-600 block">7 Fases</span>
                <span className="text-xs font-bold text-slate-700 block">Cronograma 2026-27</span>
                <span className="text-[11px] text-slate-500">Gestión de hitos clave</span>
              </div>
            </Reveal>
            <Reveal step={5}>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 h-full">
                <span className="text-2xl font-black text-purple-600 block">6 Roles</span>
                <span className="text-xs font-bold text-slate-700 block">Seguridad RBAC</span>
                <span className="text-[11px] text-slate-500">Permisos por perfil</span>
              </div>
            </Reveal>
          </div>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Bienvenida a la presentación. Explica la propuesta de valor: sustituir la improvisación por datos. [Paso 2] 1º Cuadro: 68 municipios cargados. [Paso 3] 2º Cuadro: rigor matemático 100% Ley D’Hondt. [Paso 4] 3º Cuadro: cronograma en 7 fases. [Paso 5] 4º Cuadro: 6 perfiles de seguridad RBAC.',
    },

    // 2. El Desafío Municipal (2 pasos: Tarjeta Errores -> Tarjeta Soluciones)
    {
      id: 2,
      category: 'Diagnóstico de Necesidad',
      categoryColor: 'bg-amber-600 text-white',
      title: 'El Reto de las Elecciones Municipales',
      subtitle: '¿Por qué las campañas locales se pierden en la última milla?',
      steps: 2,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Reveal step={1} className="h-full">
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 h-full">
              <span className="text-xs font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Los 4 Errores Clásicos de Campaña
              </span>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold text-sm shrink-0">✕</span>
                  <span><strong>Desconocimiento del coste real del concejal:</strong> No saber cuántos votos exactos separan al partido del concejal decisivo o de la mayoría absoluta.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold text-sm shrink-0">✕</span>
                  <span><strong>Acción dispersa sin foco territorial:</strong> Gastar tiempo y recursos en zonas donde el voto ya está fidelizado o es inalcanzable.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold text-sm shrink-0">✕</span>
                  <span><strong>Discurso reactivo e inconsistente:</strong> Bailar al ritmo de los rivales sin argumentarios preparados ni réplicas ensayadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold text-sm shrink-0">✕</span>
                  <span><strong>Descoordinación del comité semanal:</strong> Reuniones sin actas vinculantes, acuerdos olvidados y bloqueos sin resolver.</span>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal step={2} className="h-full">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 h-full">
              <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> La Respuesta de Ruta 2027
              </span>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Matemática electoral transparente:</strong> Cálculo exacto con Ley D’Hondt del corte de concejales y concejales a disputar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Matriz de competitividad por distritos:</strong> Clasificación estratégica (Fortaleza, Crecimiento, Defensa, Oportunidad).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Banco de mensajes y radar de rivales:</strong> Argumentario unificado y monitorización de movimientos de los competidores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Gobernanza semanal implacable:</strong> Actas de comités con acuerdos cerrados e informe ejecutivo en 4 preguntas.</span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Explica los 4 errores tradicionales de una campaña amateur. [Paso 2] Muestra cómo la metodología de Ruta 2027 neutraliza cada uno de ellos con rigor y datos.',
    },

    // 3. Arquitectura Global (4 Pasos: Cada bloque uno a uno)
    {
      id: 3,
      category: 'Estructura del Sistema',
      categoryColor: 'bg-blue-600 text-white',
      title: 'Los 4 Bloques Funcionales del Sistema',
      subtitle: 'Una arquitectura integral pensada para los ritmos de una campaña real',
      steps: 4,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal step={1}>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 h-full">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Operativa Semanal</h4>
              <p className="text-xs text-slate-600">
                Panel "Esta Semana", agenda de actos y visitas a pie de calle, actas de comités de dirección e informes imprimibles.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-blue-700">
                / • /actos • /seguimiento • /informe
              </div>
            </div>
          </Reveal>

          <Reveal step={2}>
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2 h-full">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Diagnóstico y Datos</h4>
              <p className="text-xs text-slate-600">
                Escrutinio 2023, censo, nulos y blancos, mapa de partidos rivales, análisis territorial distrital y test de 21 preguntas.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-sky-700">
                /resultados-2023 • /partidos • /distritos
              </div>
            </div>
          </Reveal>

          <Reveal step={3}>
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2 h-full">
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Simulador y DAFO</h4>
              <p className="text-xs text-slate-600">
                Simulador interactivo Ley D’Hondt adaptado a los concejales del municipio con doble columna y matriz DAFO municipal.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-rose-700">
                /simulacion • /diagnostico • /auditoria
              </div>
            </div>
          </Reveal>

          <Reveal step={4}>
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2 h-full">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Estrategia y Mensaje</h4>
              <p className="text-xs text-slate-600">
                3 prioridades políticas, hoja de ruta en 7 fases con hitos, banco de mensajes con réplicas y radar de rivales.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-purple-700">
                /prioridades • /hoja-de-ruta • /mensajes
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] 1er Bloque: Operativa Semanal. [Paso 2] 2º Bloque: Diagnóstico y Datos Electorales. [Paso 3] 3er Bloque: Simulador Ley D’Hondt. [Paso 4] 4º Bloque: Estrategia y Relato Político.',
    },

    // 4. Datos Oficiales 68 Municipios (4 Pasos: Censo -> Concejales -> Selector -> Lista Municipios)
    {
      id: 4,
      category: 'Base de Datos',
      categoryColor: 'bg-emerald-600 text-white',
      title: 'Datos Reales: 68 Municipios de Sevilla',
      subtitle: 'Escrutinio 2023 importado directamente de actas electorales oficiales',
      steps: 4,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <Reveal step={1}>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 h-full">
                <span className="font-bold text-slate-800 text-sm block flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-red-600" /> Censo y Participación
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Cada municipio cuenta con su censo electoral exacto, votos válidos, abstención, votos nulos y votos en blanco registrados en 2023.
                </p>
              </div>
            </Reveal>

            <Reveal step={2}>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 h-full">
                <span className="font-bold text-slate-800 text-sm block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" /> Concejales Reales
                </span>
                <p className="text-slate-600 leading-relaxed">
                  El simulador y el sistema se calibran automáticamente al número legal de concejales de cada localidad (7, 9, 11, 13, 17, etc.) según su población LOREG.
                </p>
              </div>
            </Reveal>

            <Reveal step={3}>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 h-full">
                <span className="font-bold text-slate-800 text-sm block flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" /> Selector en Tiempo Real
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Buscador instantáneo en la cabecera y en el módulo de municipios que conmuta la campaña activa en 1 clic sin recargar sesiones.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal step={4}>
            <div className="p-4 bg-slate-900 text-white rounded-xl text-xs space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                Ejemplos de municipios cargados con datos 100% reales:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Montellano (13 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Alanís (9 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Constantina (13 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Cazalla de la Sierra (11 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Guadalcanal (11 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">El Ronquillo (9 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">El Pedroso (9 conc.)</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">... hasta 68 localidades</span>
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Censo y participación. [Paso 2] Cuadro 2: Concejales reales LOREG. [Paso 3] Cuadro 3: Selector en tiempo real. [Paso 4] Cuadro 4: Los 68 municipios de Sevilla cargados.',
    },

    // 5. Panel de Mando "Esta Semana" (4 Pasos: Objetivo -> Cuenta Atrás -> Control Estados -> 6 Preguntas)
    {
      id: 5,
      category: 'Módulo Operativo',
      categoryColor: 'bg-blue-600 text-white',
      title: 'Panel de Mando: "Esta Semana"',
      subtitle: 'La pantalla de aterrizaje diaria para el comité y el candidato',
      steps: 4,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Reveal step={1}>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 h-full">
                <span className="font-bold text-rose-800 block text-xs mb-1">🎯 Objetivo Central</span>
                <p className="text-slate-700">Meta clara de concejales para gobernar en solitario o encabezar coalición.</p>
              </div>
            </Reveal>

            <Reveal step={2}>
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 h-full">
                <span className="font-bold text-blue-800 block text-xs mb-1">⏳ Cuenta Atrás 2027</span>
                <p className="text-slate-700">Barra de progreso que sitúa al equipo en la fase exacta del calendario electoral.</p>
              </div>
            </Reveal>

            <Reveal step={3}>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 h-full">
                <span className="font-bold text-emerald-800 block text-xs mb-1">✅ Control de Estados</span>
                <p className="text-slate-700">Conmutación en 1 clic entre Pendiente, En Curso y Completada.</p>
              </div>
            </Reveal>
          </div>

          <Reveal step={4}>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-xs block">
                Las 6 Preguntas Clave que Todo Equipo Debe Saber Responder Cada Semana:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">1. ¿Dónde somos fuertes?</div>
                <div className="p-2 bg-white rounded border border-slate-200">2. ¿Dónde se decide la elección?</div>
                <div className="p-2 bg-white rounded border border-slate-200">3. ¿Qué decimos siempre?</div>
                <div className="p-2 bg-white rounded border border-slate-200">4. ¿De qué no hablamos jamás?</div>
                <div className="p-2 bg-white rounded border border-slate-200">5. ¿Qué hace el candidato esta semana?</div>
                <div className="p-2 bg-white rounded border border-slate-200">6. ¿Qué hacen los rivales?</div>
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Objetivo central de concejales. [Paso 2] Cuadro 2: Cuenta atrás cronológica. [Paso 3] Cuadro 3: Control ágil de tareas (Pendiente, Curso, Hecho). [Paso 4] Cuadro 4: Las 6 preguntas semanales clave.',
    },

    // 6. Actos y Visitas (4 Pasos: Salida a Pie -> Carpa -> Reunión -> Ficha Completa)
    {
      id: 6,
      category: 'Módulo Operativo',
      categoryColor: 'bg-emerald-600 text-white',
      title: 'Actos, Visitas Vecinales y Contacto',
      subtitle: 'Presencia en la calle planificada con rigor y mensaje asignado',
      steps: 4,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-3 h-full">
            <h4 className="font-bold text-slate-800 text-sm">Tipologías de Actividad Registrables:</h4>
            <div className="space-y-2">
              <Reveal step={1}>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 block">🚶 Salida a Pie / Visita Vecinal (VISIT)</span>
                  <span className="text-slate-600 text-[11px]">Paseos por barriadas concretas escuchando demandas directas.</span>
                </div>
              </Reveal>
              <Reveal step={2}>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="font-bold text-blue-800 block">🎪 Carpa Informativa / Calle (EVENT)</span>
                  <span className="text-slate-600 text-[11px]">Reparto de folletos y recogida de quejas ciudadanas en puntos clave.</span>
                </div>
              </Reveal>
              <Reveal step={3}>
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="font-bold text-purple-800 block">🤝 Reunión Sectorial (MEETING)</span>
                  <span className="text-slate-600 text-[11px]">Encuentros con comerciantes, agricultores, pensionistas, clubes deportivos.</span>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal step={4} className="h-full">
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 h-full">
              <h4 className="font-bold text-slate-800 text-sm">Ficha Completa de Cada Acción:</h4>
              <ul className="space-y-2 text-slate-700 text-[11px]">
                <li><strong>• Título y Fecha Prevista:</strong> Con calendario interactivo.</li>
                <li><strong>• Distrito Asignado:</strong> Vinculado al análisis territorial.</li>
                <li><strong>• Prioridad Política:</strong> Relacionada con los 3 pilares irrenunciables.</li>
                <li><strong>• Público Objetivo:</strong> A quién va dirigido (ej: jóvenes, familias).</li>
                <li><strong>• Mensaje Principal:</strong> El titular exacto que debe quedar en la mente del vecino.</li>
                <li><strong>• Edición y Eliminación Completa:</strong> Modal CRUD integrado.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] 1ª Actividad: Visitas vecinales a pie. [Paso 2] 2ª Actividad: Carpas y reparto de material. [Paso 3] 3ª Actividad: Encuentros sectoriales con gremios. [Paso 4] 4º Cuadro: Ficha estratégica con mensaje asignado para que nadie improvise.',
    },

    // 7. Seguimiento y Reuniones de Comité (5 Pasos: 4 Fases de reunión una a una + Historial)
    {
      id: 7,
      category: 'Gobernanza de Campaña',
      categoryColor: 'bg-purple-600 text-white',
      title: 'Seguimiento Semanal y Actas de Comité',
      subtitle: 'Gobernanza formal, acuerdos vinculantes y resolución de bloqueos',
      steps: 5,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Reveal step={1}>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 h-full">
                <span className="font-bold text-slate-800 block text-xs mb-1">1. Orden del Día</span>
                <p className="text-slate-600">Puntos acordados previamente para no dispersar el tiempo del comité.</p>
              </div>
            </Reveal>
            <Reveal step={2}>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 h-full">
                <span className="font-bold text-emerald-800 block text-xs mb-1">2. Decisiones y Acuerdos</span>
                <p className="text-slate-600">Compromisos con responsables concretos para ejecutar esa semana.</p>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 h-full">
                <span className="font-bold text-amber-800 block text-xs mb-1">3. Bloqueos Detectados</span>
                <p className="text-slate-600">Falta de material, retrasos o problemas logísticos que exigen desbloqueo.</p>
              </div>
            </Reveal>
            <Reveal step={4}>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 h-full">
                <span className="font-bold text-rose-800 block text-xs mb-1">4. Riesgos Emergentes</span>
                <p className="text-slate-600">Anuncios de rivales, polémicas o cambios que exigen cautela.</p>
              </div>
            </Reveal>
          </div>

          <Reveal step={5}>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Historial Digital de Actas</h4>
                <p className="text-slate-500 text-xs">Todas las reuniones pasadas quedan archivadas, editables y auditables.</p>
              </div>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs">
                Actas Oficiales Cerradas
              </span>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Orden del día. [Paso 2] Cuadro 2: Acuerdos vinculantes. [Paso 3] Cuadro 3: Bloqueos y soluciones. [Paso 4] Cuadro 4: Riesgos emergentes. [Paso 5] Cuadro 5: Archivo formal de actas.',
    },

    // 8. Informe Ejecutivo Imprimible (5 Pasos: Cabecera -> 4 Preguntas una a una)
    {
      id: 8,
      category: 'Gobernanza de Campaña',
      categoryColor: 'bg-amber-600 text-white',
      title: 'Informe Semanal Ejecutivo (PDF)',
      subtitle: 'La estructura de las 4 preguntas esenciales lista para el candidato',
      steps: 5,
      content: (
        <div className="space-y-4 text-xs">
          <Reveal step={1}>
            <div className="p-4 bg-slate-900 text-white rounded-xl">
              <h4 className="font-bold text-sm text-slate-200 mb-1">Formato Ejecutivo de Máximo Nivel:</h4>
              <p className="text-slate-400 text-xs">
                Genera un documento maquetado con diseño limpio y tipografía profesional para llevar impreso al comité de dirección o exportar a PDF en 1 clic.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Reveal step={2}>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 h-full">
                <span className="font-bold text-emerald-800 block text-sm">✓ ¿Qué se hizo?</span>
                <p className="text-slate-700 text-xs">Balance objetivo de actos celebrados, visitas concluidas y materiales distribuidos.</p>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1 h-full">
                <span className="font-bold text-rose-800 block text-sm">✕ ¿Qué no se hizo?</span>
                <p className="text-slate-700 text-xs">Autocrítica honesta de compromisos atrasados o acciones pospuestas.</p>
              </div>
            </Reveal>
            <Reveal step={4}>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1 h-full">
                <span className="font-bold text-blue-800 block text-sm">👥 ¿Qué hicieron los rivales?</span>
                <p className="text-slate-700 text-xs">Resumen de declaraciones, actos y errores detectados en las demás fuerzas.</p>
              </div>
            </Reveal>
            <Reveal step={5}>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1 h-full">
                <span className="font-bold text-purple-800 block text-sm">💡 ¿Qué aprendió el equipo?</span>
                <p className="text-slate-700 text-xs">Conclusiones prácticas y ajustes tácticos para la semana entrante.</p>
              </div>
            </Reveal>
          </div>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Presenta el formato ejecutivo en PDF. [Paso 2] 1ª Pregunta: ¿Qué se hizo? [Paso 3] 2ª Pregunta: ¿Qué no se hizo? [Paso 4] 3ª Pregunta: ¿Qué hicieron los rivales? [Paso 5] 4ª Pregunta: ¿Qué aprendió el equipo?',
    },

    // 9. Resultados Electorales 2023 (5 Pasos: Censo -> Participación -> Abstención -> Nulos -> Conclusiones)
    {
      id: 9,
      category: 'Diagnóstico Electoral',
      categoryColor: 'bg-sky-600 text-white',
      title: 'Escrutinio 2023: Línea Base Oficial',
      subtitle: 'Análisis detallado de votos, concejales y participación',
      steps: 5,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Reveal step={1}>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 h-full">
                <span className="text-slate-500 block text-[11px]">Censo Electoral</span>
                <span className="font-black text-slate-800 text-base">Total Vecinos</span>
              </div>
            </Reveal>
            <Reveal step={2}>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 h-full">
                <span className="text-emerald-700 block text-[11px]">Participación</span>
                <span className="font-black text-emerald-800 text-base">Votos Válidos</span>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 h-full">
                <span className="text-amber-700 block text-[11px]">Abstención</span>
                <span className="font-black text-amber-800 text-base">Bolsa de Voto</span>
              </div>
            </Reveal>
            <Reveal step={4}>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 h-full">
                <span className="text-rose-700 block text-[11px]">Nulos y Blancos</span>
                <span className="font-black text-rose-800 text-base">Voto de Castigo</span>
              </div>
            </Reveal>
          </div>

          <Reveal step={5}>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Qué revela la Línea Base 2023:</h4>
              <ul className="space-y-1.5 text-slate-700 text-xs">
                <li>• <strong>Distribución exacta de concejales:</strong> Quién gobierna, con qué margen y qué pactos permitieron la alcaldía.</li>
                <li>• <strong>Correlación de fuerzas:</strong> Porcentaje real alcanzado por cada sigla política en la última cita con las urnas.</li>
                <li>• <strong>Bolsa de abstención:</strong> Número exacto de votantes que no acudieron a votar y que representan el mayor potencial de crecimiento.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Censo electoral. [Paso 2] Cuadro 2: Participación. [Paso 3] Cuadro 3: Abstención y desmovilización. [Paso 4] Cuadro 4: Nulos y blancos. [Paso 5] Cuadro 5: Conclusiones estratégicas de partida.',
    },

    // 10. Partidos y Metodología Epistemológica (4 Pasos: 4 Niveles de conocimiento)
    {
      id: 10,
      category: 'Inteligencia Política',
      categoryColor: 'bg-indigo-600 text-white',
      title: 'Mapeo de Candidaturas y Rivales',
      subtitle: 'Separación rigurosa en 4 niveles de conocimiento político',
      steps: 4,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 h-full">
            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider block">
              Niveles 1 y 2: Información Comprobada
            </span>
            <div className="space-y-2">
              <Reveal step={1}>
                <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                  <span className="font-bold text-emerald-400 block text-xs">📊 1. Dato Confirmado</span>
                  <span className="text-slate-300 text-[11px]">Escrutinio oficial LOREG 2023, actas municipales y número de concejales.</span>
                </div>
              </Reveal>
              <Reveal step={2}>
                <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                  <span className="font-bold text-blue-400 block text-xs">📢 2. Información Pública</span>
                  <span className="text-slate-300 text-[11px]">Declaraciones en prensa, mociones plenarias, listas y publicaciones en redes.</span>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 h-full">
            <span className="text-xs font-bold uppercase text-purple-400 tracking-wider block">
              Niveles 3 y 4: Estrategia e Hipótesis
            </span>
            <div className="space-y-2">
              <Reveal step={3}>
                <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                  <span className="font-bold text-amber-400 block text-xs">🧠 3. Valoración del Equipo</span>
                  <span className="text-slate-300 text-[11px]">Evaluación interna de fortalezas y debilidades de cada candidato rival.</span>
                </div>
              </Reveal>
              <Reveal step={4}>
                <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                  <span className="font-bold text-purple-400 block text-xs">🔮 4. Hipótesis de Trabajo</span>
                  <span className="text-slate-300 text-[11px]">Escenarios de pactos post-electorales 2027 y posibles coaliciones.</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Nivel 1: Datos oficiales y actas. [Paso 2] Nivel 2: Información pública y prensa. [Paso 3] Nivel 3: Valoración interna del candidato rival. [Paso 4] Nivel 4: Hipótesis de pactos y alianzas.',
    },

    // 11. Análisis por Distritos (3 Pasos: Cuadrante de 4 categorías -> Comparativa Media -> Brecha Rival)
    {
      id: 11,
      category: 'Estrategia Territorial',
      categoryColor: 'bg-teal-600 text-white',
      title: 'Análisis Territorial por Distritos',
      subtitle: 'Matriz de competitividad y brecha frente al primer rival',
      steps: 3,
      content: (
        <div className="space-y-4 text-xs">
          <Reveal step={1}>
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Clasificación Estratégica de Distritos:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  🏰 Fortaleza (Bastión propio)
                </div>
                <div className="p-2 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  📈 Crecimiento (Mayor potencial)
                </div>
                <div className="p-2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  🛡️ Defensa (Margen estrecho)
                </div>
                <div className="p-2 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                  🎯 Oportunidad (Descontento rival)
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Reveal step={2}>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 h-full">
                <span className="font-bold text-slate-800 block text-xs">📊 Comparativa vs Media Municipal</span>
                <p className="text-slate-600 text-xs">Indica instantáneamente si la candidatura está por encima (+%) o por debajo (-%) de su media global en cada zona.</p>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 h-full">
                <span className="font-bold text-slate-800 block text-xs">⚡ Brecha / Margen con el Rival</span>
                <p className="text-slate-600 text-xs">Muestra el número exacto de votos de ventaja o desventaja respecto a la primera fuerza de la barriada.</p>
              </div>
            </Reveal>
          </div>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Los 4 cuadrantes territoriales (Fortaleza, Crecimiento, Defensa, Oportunidad). [Paso 2] Cuadro 2: Comparativa vs la media municipal. [Paso 3] Cuadro 3: Brecha en votos directos con el primer rival.',
    },

    // 12. Simulador D'Hondt (4 Pasos: Doble Columna -> Recálculo -> Algoritmo LOREG -> Preguntas del Comité)
    {
      id: 12,
      category: 'Simulación Electoral',
      categoryColor: 'bg-rose-600 text-white',
      title: 'Simulador Electoral con Ley D’Hondt',
      subtitle: 'Cálculo matemático exacto con doble columna y proyección en tiempo real',
      steps: 4,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Reveal step={1}>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 h-full">
                <span className="font-bold text-rose-800 block text-xs mb-1">🔢 Doble Columna de Votos</span>
                <p className="text-slate-700">Mantiene la columna con los votos originales de 2023 junto a la columna de votos proyectados.</p>
              </div>
            </Reveal>
            <Reveal step={2}>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 h-full">
                <span className="font-bold text-emerald-800 block text-xs mb-1">🔄 Recálculo Bidireccional</span>
                <p className="text-slate-700">Al cambiar el porcentaje se recalculan los votos; al cambiar los votos se recalcula el porcentaje.</p>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 h-full">
                <span className="font-bold text-blue-800 block text-xs mb-1">⚖️ Algoritmo LOREG Art. 163</span>
                <p className="text-slate-700">Reparto estricto por cocientes decrecientes adaptado a los concejales del municipio activo.</p>
              </div>
            </Reveal>
          </div>

          <Reveal step={4}>
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <h4 className="font-bold text-sm text-slate-200">¿Qué responde el simulador al comité de campaña?</h4>
              <ul className="space-y-1 text-slate-300 text-xs">
                <li>• ¿Cuántos votos necesitamos exactamente para ganar el siguiente concejal?</li>
                <li>• ¿A qué distancia en votos está la mayoría absoluta (la mitad + 1)?</li>
                <li>• ¿Qué ocurre si la abstención sube o baja un 5%?</li>
                <li>• ¿Qué impacto tiene la concentración de voto o la aparición de una lista independiente?</li>
              </ul>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Doble columna para comparar 2023 vs proyección. [Paso 2] Cuadro 2: Recálculo bidireccional instantáneo. [Paso 3] Cuadro 3: Algoritmo LOREG sin errores. [Paso 4] Cuadro 4: Respuestas exactas: coste del concejal y umbrales de gobierno.',
    },

    // 13. Diagnóstico DAFO y Auditoría (2 Pasos: Matriz DAFO -> Auditoría 21 Preguntas)
    {
      id: 13,
      category: 'Diagnóstico Estratégico',
      categoryColor: 'bg-orange-600 text-white',
      title: 'Diagnóstico DAFO y Auditoría 21 Preguntas',
      subtitle: 'Evaluación continua del estado de salud de la candidatura',
      steps: 2,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Reveal step={1} className="h-full">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 h-full">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-600" /> Matriz DAFO Territorial
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                  <span className="font-bold text-emerald-800 block">💪 Fortalezas</span>
                  <span className="text-slate-600">Activos internos propios</span>
                </div>
                <div className="p-2 bg-rose-50 rounded border border-rose-200">
                  <span className="font-bold text-rose-800 block">⚠️ Debilidades</span>
                  <span className="text-slate-600">Carencias a corregir</span>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="font-bold text-blue-800 block">✨ Oportunidades</span>
                  <span className="text-slate-600">Huecos en el electorado</span>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <span className="font-bold text-amber-800 block">⚡ Amenazas</span>
                  <span className="text-slate-600">Riesgos externos del rival</span>
                </div>
              </div>
              <p className="text-slate-500 text-[11px]">Capacidad completa de crear, editar y eliminar matrices DAFO por distrito.</p>
            </div>
          </Reveal>

          <Reveal step={2} className="h-full">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 h-full">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" /> Auditoría de 21 Preguntas
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Test estructurado en 12 dimensiones de campaña: candidato, relato, equipo, censo, finanzas, movilización, redes, apoderados, etc.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <span className="font-bold text-slate-800 block">Semáforo de Madurez Electoral:</span>
                <p>Genera un índice porcentual de preparación que avisa de las áreas críticas antes de que empiece la campaña oficial.</p>
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Matriz DAFO por distrito. [Paso 2] Cuadro 2: Auditoría de 21 preguntas y semáforo de madurez electoral.',
    },

    // 14. Estrategia y Hoja de Ruta (4 Pasos: Prioridad 1 -> Prioridad 2 -> Prioridad 3 -> Cronograma 7 Fases)
    {
      id: 14,
      category: 'Estrategia y Cronograma',
      categoryColor: 'bg-blue-600 text-white',
      title: 'Estrategia Central y Hoja de Ruta',
      subtitle: 'Las 3 prioridades políticas y el cronograma de 7 fases',
      steps: 4,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Reveal step={1}>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 h-full">
                <span className="font-black text-red-700 text-sm block">Prioridad 1</span>
                <span className="font-bold text-slate-800 block text-xs">Pilar Irrenunciable</span>
                <span className="text-slate-600 text-[11px]">El gran tema que define la candidatura.</span>
              </div>
            </Reveal>
            <Reveal step={2}>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 h-full">
                <span className="font-black text-amber-700 text-sm block">Prioridad 2</span>
                <span className="font-bold text-slate-800 block text-xs">Pilar Social / Económico</span>
                <span className="text-slate-600 text-[11px]">Respuesta a la principal queja vecinal.</span>
              </div>
            </Reveal>
            <Reveal step={3}>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 h-full">
                <span className="font-black text-emerald-700 text-sm block">Prioridad 3</span>
                <span className="font-bold text-slate-800 block text-xs">Pilar de Futuro</span>
                <span className="text-slate-600 text-[11px]">Proyecto emblemático de legislatura.</span>
              </div>
            </Reveal>
          </div>

          <Reveal step={4}>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Cronograma en 7 Fases Hacia Mayo 2027:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-[11px] text-center font-bold">
                <span className="p-2 rounded bg-white border border-slate-200 text-slate-700">1. Diagnóstico</span>
                <span className="p-2 rounded bg-white border border-slate-200 text-slate-700">2. Posición</span>
                <span className="p-2 rounded bg-white border border-slate-200 text-slate-700">3. Presencia</span>
                <span className="p-2 rounded bg-white border border-slate-200 text-slate-700">4. Activación</span>
                <span className="p-2 rounded bg-white border border-slate-200 text-slate-700">5. Contacto</span>
                <span className="p-2 rounded bg-red-100 border border-red-300 text-red-800">6. Campaña</span>
                <span className="p-2 rounded bg-emerald-100 border border-emerald-300 text-emerald-800">7. Voto</span>
              </div>
              <p className="text-slate-500 text-[11px] pt-1">
                Cada fase permite añadir hitos específicos con fecha límite, editarlos, eliminarlos y marcarlos con un clic.
              </p>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Prioridad 1 (Tema central). [Paso 2] Cuadro 2: Prioridad 2 (Social/Económico). [Paso 3] Cuadro 3: Prioridad 3 (Proyecto de futuro). [Paso 4] Cuadro 4: Cronograma de 7 fases.',
    },

    // 15. Mensajes y Radar de Rivales (2 Pasos: Banco de Mensajes -> Radar de Rivales)
    {
      id: 15,
      category: 'Relato y Comunicación',
      categoryColor: 'bg-red-600 text-white',
      title: 'Banco de Mensajes y Radar de Rivales',
      subtitle: 'Disciplina comunicativa y seguimiento de competidores',
      steps: 2,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Reveal step={1} className="h-full">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 h-full">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4 text-red-600" /> Banco de Mensajes
              </h4>
              <p className="text-slate-600">
                Estructura oficial para que militantes, candidatos y portavoces utilicen los mismos argumentos:
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-red-50 border border-red-200 font-semibold text-red-800">
                  • Mensajes Principales: La tesis central de campaña.
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-200 font-semibold text-rose-800">
                  • Respuestas a Ataques: Réplicas ensayadas a críticas previsibles.
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200 font-semibold text-blue-800">
                  • Preguntas Frecuentes (FAQ) y Datos Contrastados.
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal step={2} className="h-full">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 h-full">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sky-600" /> Radar de Rivales
              </h4>
              <p className="text-slate-600">
                Monitorización sistemática de los movimientos de los partidos competidores:
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                  <strong>Clasificación:</strong> Declaración, Propuesta, Acto, Ataque, Alianza, Error o Cambio de Candidato.
                </div>
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                  <strong>Oportunidad de Diferenciación:</strong> Cómo convertir el movimiento del rival en ventaja para nuestra lista.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Banco de mensajes y respuestas ensayadas. [Paso 2] Cuadro 2: Radar de rivales y conversión de sus fallos en ventajas.',
    },

    // 16. Roles, Seguridad y Conclusión (2 Pasos: Roles RBAC -> Cierre / Conclusión)
    {
      id: 16,
      category: 'Gobernanza y Conclusiones',
      categoryColor: 'bg-slate-900 text-white',
      title: 'Seguridad, Roles y Ventaja Competitiva',
      subtitle: 'La herramienta definitiva para gobernar en Mayo de 2027',
      steps: 2,
      content: (
        <div className="space-y-4 text-xs">
          <Reveal step={1}>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Control de Acceso Basado en Roles (RBAC):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Director de Campaña:</strong> Control total de edición.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Candidato:</strong> Visión ejecutiva y agenda directa.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Comunicación:</strong> Banco de mensajes y prensa.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Líder Territorial:</strong> Fichas y tareas de su distrito.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Supervisor General:</strong> Observador de comités.
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <strong>Administrador:</strong> Configuración global.
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal step={2}>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-center space-y-2 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-black">Lista para Ganar en Mayo de 2027</h3>
              <p className="text-xs sm:text-sm text-red-100 max-w-xl mx-auto">
                Datos matemáticos rigurosos, gobernanza semanal sin fisuras y relato político unificado en los 68 municipios de Sevilla.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-white text-red-700 font-bold rounded-xl text-xs shadow hover:bg-red-50 transition inline-flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Comenzar a Trabajar en el Panel Principal
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      ),
      speakerNotes:
        '[Paso 1] Cuadro 1: Los 6 perfiles de seguridad RBAC. [Paso 2] Cuadro 2: Conclusión y llamada a la acción: disponible para todo el equipo.',
    },
  ];

  const totalSlides = slides.length;
  const slide = slides[currentSlide];

  // Progressive navigation logic
  const nextStepOrSlide = useCallback(() => {
    if (stepByStepMode && currentStep < slide.steps) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      setCurrentStep(1);
    }
  }, [stepByStepMode, currentStep, slide?.steps, currentSlide, totalSlides]);

  const prevStepOrSlide = useCallback(() => {
    if (stepByStepMode && currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (currentSlide > 0) {
      const prevIdx = currentSlide - 1;
      setCurrentSlide(prevIdx);
      setCurrentStep(slides[prevIdx]?.steps || 1);
    }
  }, [stepByStepMode, currentStep, currentSlide, slides]);

  const nextSlideDirect = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      setCurrentStep(1);
    }
  }, [currentSlide, totalSlides]);

  const prevSlideDirect = useCallback(() => {
    if (currentSlide > 0) {
      const prevIdx = currentSlide - 1;
      setCurrentSlide(prevIdx);
      setCurrentStep(1);
    }
  }, [currentSlide]);

  const revealAllSteps = useCallback(() => {
    setCurrentStep(slide.steps);
  }, [slide?.steps]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          nextSlideDirect();
        } else {
          nextStepOrSlide();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        if (e.shiftKey) {
          prevSlideDirect();
        } else {
          prevStepOrSlide();
        }
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
        setStepByStepMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNotes((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setShowOverview((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStepOrSlide, prevStepOrSlide, nextSlideDirect, prevSlideDirect, revealAllSteps]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="print:hidden border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Volver a la aplicación"
          >
            <Home className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Volver a la App</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <span className="text-xs font-bold text-slate-400 hidden md:inline">
            Presentación de Funcionalidades • Elecciones M27
          </span>
        </div>

        {/* Slide Counter and Fast Controls */}
        <div className="flex items-center gap-2">
          {/* Step-by-Step Toggle Mode */}
          <button
            type="button"
            onClick={() => setStepByStepMode(!stepByStepMode)}
            className={\`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 \${
              stepByStepMode
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }\`}
            title="Activar / Desactivar aparición secuencial paso a paso (Tecla P)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{stepByStepMode ? 'Paso a Paso: ON' : 'Paso a Paso: OFF'}</span>
          </button>

          {/* Download PowerPoint Button */}
          <a
            href="/presentacion_elecciones_m27.pptx"
            download="presentacion_elecciones_m27.pptx"
            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs hover:shadow"
            title="Descargar presentación oficial en PowerPoint (.pptx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PowerPoint (.pptx)</span>
            <span className="md:hidden">PPTX</span>
          </a>

          {/* Download / Print PDF Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs hover:shadow"
            title="Descargar o Imprimir las 16 diapositivas como documento PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Standalone HTML Button */}
          <a
            href="/presentacion_elecciones_m27.html"
            download="presentacion_elecciones_m27.html"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition hidden xl:flex items-center gap-1.5"
            title="Descargar presentación autónoma en HTML para abrir sin conexión ni servidor"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>HTML Offline</span>
          </a>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <button
            type="button"
            onClick={() => setShowOverview(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
            title="Ver índice de diapositivas (Tecla M)"
          >
            <Grid className="w-3.5 h-3.5 text-red-400" />
            <span>
              {currentSlide + 1} / {totalSlides}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className={\`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 \${
              showNotes ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }\`}
            title="Notas del orador (Tecla N)"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Notas</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Pantalla Completa (Tecla F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="print:hidden flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl w-full mx-auto relative overflow-hidden">
        {/* Slide Canvas Card */}
        <div
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a') || target.closest('input')) {
              return;
            }
            nextStepOrSlide();
          }}
          className="w-full bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-10 flex flex-col justify-between min-h-[520px] transition-all duration-300 relative cursor-pointer"
          title="Haz clic en cualquier punto para avanzar al siguiente cuadro"
        >
          {/* Header of the Slide */}
          <div className="border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={\`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full \${slide.categoryColor}\`}
                >
                  {slide.category}
                </span>
                {stepByStepMode && slide.steps > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    Paso {currentStep} de {slide.steps}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                {stepByStepMode && currentStep < slide.steps && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      revealAllSteps();
                    }}
                    className="text-[11px] text-slate-500 hover:text-red-600 transition flex items-center gap-1 font-semibold"
                    title="Mostrar todos los cuadros de esta diapositiva (Tecla R)"
                  >
                    <span>Mostrar todo</span>
                    <span className="bg-slate-100 px-1 py-0.2 rounded text-[9px] font-mono">R</span>
                  </button>
                )}
                <span>
                  Diapositiva {slide.id} de {totalSlides}
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{slide.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{slide.subtitle}</p>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 flex flex-col justify-center">{slide.content}</div>

          {/* Slide Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Ruta 2027 • Inteligencia Electoral Municipal</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[10px] text-slate-600">Espacio / Clic</span>
              <span>para avanzar cuadro por cuadro</span>
            </div>
            <span>Sevilla 2027</span>
          </div>
        </div>

        {/* Speaker Notes Overlay / Drawer */}
        {showNotes && (
          <div className="w-full max-w-4xl mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between font-bold text-amber-400 uppercase text-[10px] tracking-wider">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Guión y Notas para el Orador (Diapositiva {slide.id})
              </span>
              <button
                onClick={() => setShowNotes(false)}
                className="text-amber-400 hover:text-amber-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="leading-relaxed font-medium">{slide.speakerNotes}</p>
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <footer className="print:hidden border-t border-slate-800 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0 z-30">
        <button
          type="button"
          onClick={prevStepOrSlide}
          disabled={currentSlide === 0 && currentStep === 1}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{stepByStepMode && currentStep > 1 ? 'Cuadro Anterior' : 'Anterior'}</span>
        </button>

        {/* Progress dots bar */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlide(idx);
                  setCurrentStep(1);
                }}
                className={\`h-2 rounded-full transition-all \${
                  idx === currentSlide ? 'w-6 bg-red-600' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }\`}
                title={\`Ir a diapositiva \${s.id}: \${s.title}\`}
              />
            ))}
          </div>

          {stepByStepMode && slide.steps > 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: slide.steps }).map((_, stepIdx) => (
                <div
                  key={stepIdx}
                  className={\`h-1.5 rounded-full transition-all \${
                    stepIdx + 1 <= currentStep ? 'w-3.5 bg-red-500' : 'w-1.5 bg-slate-700'
                  }\`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Skip Slide Button */}
          {currentSlide < totalSlides - 1 && (
            <button
              type="button"
              onClick={nextSlideDirect}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition hidden sm:flex items-center gap-1"
              title="Saltar directamente a la siguiente diapositiva (Shift + →)"
            >
              <span>Saltar</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={nextStepOrSlide}
            disabled={currentSlide === totalSlides - 1 && currentStep === slide.steps}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-red-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-950/40"
          >
            <span>
              {stepByStepMode && currentStep < slide.steps
                ? \`Siguiente cuadro (\${currentStep}/\${slide.steps})\`
                : 'Siguiente'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Overview Modal */}
      {showOverview && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Grid className="w-5 h-5 text-red-500" />
                <span>Índice de Diapositivas de la Presentación</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOverview(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setCurrentStep(1);
                    setShowOverview(false);
                  }}
                  className={\`p-3 rounded-xl text-left border transition \${
                    idx === currentSlide
                      ? 'bg-red-600/20 border-red-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }\`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>Diapositiva {s.id}</span>
                    <span className="uppercase text-red-400">{s.category.slice(0, 15)}</span>
                  </div>
                  <h4 className="font-bold line-clamp-1 text-xs">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{s.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Printable Container: Renders all slides on page break when printing / exporting to PDF */}
      <div className="hidden print:block bg-white text-slate-900 p-0 m-0">
        <style
          dangerouslySetInnerHTML={{
            __html: \`
              @page {
                size: landscape;
                margin: 10mm;
              }
              @media print {
                body {
                  background-color: white !important;
                  color: black !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .slide-page-break {
                  page-break-after: always;
                  break-after: page;
                  min-height: 94vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  padding: 24px;
                  box-sizing: border-box;
                }
              }
            \`,
          }}
        />
        {slides.map((s) => (
          <div
            key={s.id}
            className="slide-page-break border border-slate-200 rounded-2xl mb-8 bg-white text-slate-900 shadow-none"
          >
            <div className="border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={\`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full \${s.categoryColor}\`}
                >
                  {s.category}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Diapositiva {s.id} de {totalSlides}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{s.title}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.subtitle}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center my-3">{s.content}</div>

            {s.speakerNotes && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600">
                <strong className="text-slate-800 uppercase tracking-wide">Notas del orador:</strong> {s.speakerNotes}
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Ruta 2027 • Inteligencia Electoral Municipal</span>
              <span>Provincia de Sevilla • Plan Estratégico</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/app/presentacion/PresentacionClient.tsx'), presentacionClientCode, 'utf8');
console.log('Successfully updated PresentacionClient.tsx with granular card-by-card steps!');
