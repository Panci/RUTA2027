'use client';

import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Search, Filter, Clock, User, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  campaign?: {
    municipality: string;
    candidacyName: string;
  } | null;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'ALL') {
        params.append('action', actionFilter);
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      params.append('limit', '100');

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al cargar registros');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los registros de auditoría');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          {action}
        </span>
      );
    }
    if (action.includes('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          {action}
        </span>
      );
    }
    if (action.includes('UPDATE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          {action}
        </span>
      );
    }
    if (action.includes('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          {action}
        </span>
      );
    }
    if (action.includes('IMPORT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          {action}
        </span>
      );
    }
    if (action.includes('PASSWORD')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
        <Info className="w-3 h-3 text-slate-500" />
        {action}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Cabecera del visor */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Registro de Auditoría y Trazabilidad (RGPD / Seguridad)
            </h2>
            <span className="text-[11px] bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {totalCount} eventos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historial inmutable de accesos, modificaciones de estrategia, importaciones y acciones críticas de campaña.
          </p>
        </div>

        {/* Botón Refrescar */}
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, detalle o recurso..."
            className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-slate-800 text-white rounded text-[11px] font-semibold hover:bg-slate-900 transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="ALL">Todas las acciones</option>
            <option value="LOGIN">Inicios de sesión (LOGIN)</option>
            <option value="PASSWORD">Contraseñas (PASSWORD)</option>
            <option value="CREATE">Creaciones (CREATE)</option>
            <option value="UPDATE">Modificaciones (UPDATE)</option>
            <option value="DELETE">Eliminaciones (DELETE)</option>
            <option value="IMPORT">Importaciones (IMPORT)</option>
          </select>
        </div>
      </div>

      {/* Contenido / Tabla */}
      {error ? (
        <div className="p-6 text-center text-xs text-red-600 bg-red-50 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      ) : isLoading && logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-400 mb-2" />
          Cargando registro de auditoría...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <Shield className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          No se encontraron eventos con los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Fecha y Hora</th>
                <th className="py-2.5 px-4">Usuario</th>
                <th className="py-2.5 px-4">Acción</th>
                <th className="py-2.5 px-4">Recurso</th>
                <th className="py-2.5 px-4">Municipio</th>
                <th className="py-2.5 px-4">Detalles del Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {log.userName.charAt(0).toUpperCase()}
                      </div>
                      <span>{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">
                      {log.resource}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                    {log.campaign?.municipality || 'Global / Sistema'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-md break-words">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
