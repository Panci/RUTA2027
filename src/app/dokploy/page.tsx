import React from 'react';
import { Server, ShieldCheck, Database, Terminal, CheckCircle2, Copy, FileText, HardDrive } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DokployPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
            Infraestructura & Operaciones
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Despliegue en VPS Hostinger con Dokploy</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Arquitectura contenerizada independiente, base de datos PostgreSQL persistente y copias de seguridad cifradas.
        </p>
      </div>

      {/* Estado del Servicio y Arquitectura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-sm">Contenedor Web Next.js</h3>
          </div>
          <p className="text-xs text-slate-600">
            Modo <strong>standalone</strong> optimizado para producción en Docker multi-stage con usuario no root.
          </p>
          <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Puerto 3000 / Traefik SSL
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-sm">PostgreSQL 16</h3>
          </div>
          <p className="text-xs text-slate-600">
            Volumen persistente <code>ruta2027_postgres_data</code> montado en disco físico para cero pérdida de datos.
          </p>
          <span className="inline-block text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
            Volumen Persistente
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-700">
            <HardDrive className="w-5 h-5" />
            <h3 className="font-bold text-sm">Copias de Seguridad</h3>
          </div>
          <p className="text-xs text-slate-600">
            Servicio cron automatizado diario (03:00h) con compresión gzip y rotación a 14 días.
          </p>
          <span className="inline-block text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
            Diario + Manual
          </span>
        </div>
      </div>

      {/* Comandos Esenciales para Dokploy */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Terminal className="w-5 h-5 text-red-400" />
          <h2 className="font-bold text-base">Comandos Operativos en Dokploy (VPS Hostinger)</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold mb-1">
              1. Ejecutar migraciones seguras y semilla demo en el contenedor:
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono overflow-x-auto border border-slate-800">
              docker exec -it ruta2027-app npx prisma db push && docker exec -it ruta2027-app npm run db:seed
            </pre>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold mb-1">
              2. Generar copia de seguridad manual inmediata:
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono overflow-x-auto border border-slate-800">
              ./scripts/backup.sh
            </pre>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold mb-1">
              3. Restaurar una copia de seguridad específica:
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono overflow-x-auto border border-slate-800">
              ./scripts/restore.sh ./backups/ruta2027_backup_20260918_120000.sql.gz
            </pre>
          </div>

          <div>
            <span className="text-slate-400 block font-semibold mb-1">
              4. Comprobación de salud en tiempo real (Health Check):
            </span>
            <pre className="p-3 bg-slate-950 rounded-lg text-emerald-400 font-mono overflow-x-auto border border-slate-800">
              curl -I http://localhost:3000/api/health
            </pre>
          </div>
        </div>
      </div>

      {/* Checklist de Criterios de Aceptación (Sección 18) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-800 text-base">Criterios de Aceptación del Despliegue en Dokploy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Instalación limpia mediante Dokploy con Docker Compose</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL mantiene los datos tras reiniciar contenedores</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Variables sensibles protegidas y excluidas de Git (.gitignore)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Despliegue zero-downtime y procedimiento de rollback documentado</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Guía completa disponible en DOKPLOY_DEPLOYMENT.md</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Endpoint /api/health activo para comprobación de salud continua</span>
          </div>
        </div>
      </div>
    </div>
  );
}
