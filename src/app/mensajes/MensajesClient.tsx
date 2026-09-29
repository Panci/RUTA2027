'use client';

import React, { useState } from 'react';
import {
  MessageSquareQuote,
  ShieldCheck,
  HelpCircle,
  Database,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Filter,
} from 'lucide-react';

interface District {
  id: string;
  name: string;
}

interface MessageItem {
  id: string;
  campaignId: string;
  districtId: string | null;
  category: string;
  title: string;
  content: string;
  district?: District | null;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string; badge: string }> = {
  KEY_MESSAGE: {
    label: 'Mensaje Principal',
    icon: MessageSquareQuote,
    color: 'text-red-600',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  ATTACK_RESPONSE: {
    label: 'Respuesta a Ataque Rival',
    icon: ShieldCheck,
    color: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  FAQ: {
    label: 'Pregunta Frecuente (FAQ)',
    icon: HelpCircle,
    color: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  LOCAL_DATA: {
    label: 'Dato Local Contrastado',
    icon: Database,
    color: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export default function MensajesClient({
  initialMessages,
  districts,
  municipality,
  readOnly = false,
}: {
  initialMessages: MessageItem[];
  districts: District[];
  municipality: string;
  readOnly?: boolean;
}) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMsg, setEditingMsg] = useState<MessageItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    category: 'KEY_MESSAGE',
    title: '',
    content: '',
    districtId: '',
  });

  const handleOpenCreate = (preselectedCategory?: string) => {
    setEditingMsg(null);
    setError('');
    setFormData({
      category: preselectedCategory && preselectedCategory !== 'ALL' ? preselectedCategory : 'KEY_MESSAGE',
      title: '',
      content: '',
      districtId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (msg: MessageItem) => {
    setEditingMsg(msg);
    setError('');
    setFormData({
      category: msg.category,
      title: msg.title,
      content: msg.content,
      districtId: msg.districtId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Por favor, completa tanto el título como el contenido del mensaje.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (editingMsg) {
        // PUT
        const res = await fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMsg.id,
            ...formData,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al actualizar el mensaje.');
          return;
        }

        const updated = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      } else {
        // POST
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Error al crear el mensaje.');
          return;
        }

        const created = await res.json();
        setMessages((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje del argumentario?')) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el mensaje.');
      }
    } catch (err) {
      alert('Error de conexión al eliminar.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'ALL') return true;
    return m.category === activeTab;
  });

  const keyMessagesCount = messages.filter((m) => m.category === 'KEY_MESSAGE').length;
  const attackCount = messages.filter((m) => m.category === 'ATTACK_RESPONSE').length;
  const faqCount = messages.filter((m) => m.category === 'FAQ').length;
  const dataCount = messages.filter((m) => m.category === 'LOCAL_DATA').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-red-600">
              Comunicación y Relato
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Banco de Mensajes y Argumentarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Estructura de discurso, réplicas a ataques, preguntas frecuentes y datos contrastados de {municipality}.
          </p>
        </div>

        {!readOnly ? (
          <button
            type="button"
            onClick={() => handleOpenCreate(activeTab)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Mensaje / Argumentario
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 shrink-0">
            <span>👁️ Modo Solo Lectura</span>
          </div>
        )}
      </div>

      {/* Tabs / Filters Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Todos los Mensajes ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('KEY_MESSAGE')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'KEY_MESSAGE'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquareQuote className="w-3.5 h-3.5" />
          Principales ({keyMessagesCount})
        </button>

        <button
          onClick={() => setActiveTab('ATTACK_RESPONSE')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ATTACK_RESPONSE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Réplicas a Ataques ({attackCount})
        </button>

        <button
          onClick={() => setActiveTab('FAQ')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'FAQ'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Preguntas Frecuentes ({faqCount})
        </button>

        <button
          onClick={() => setActiveTab('LOCAL_DATA')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'LOCAL_DATA'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Datos Contrastados ({dataCount})
        </button>
      </div>

      {/* Grid or Empty State */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <MessageSquareQuote className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No hay mensajes registrados en esta sección</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crea discursos clave, respuestas para desarmar críticas o datos contrastados para alimentar las intervenciones en {municipality}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenCreate(activeTab)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Añadir Mensaje
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMessages.map((msg) => {
            const cat = CATEGORY_MAP[msg.category] || {
              label: msg.category,
              badge: 'bg-slate-100 text-slate-700 border-slate-200',
              color: 'text-slate-600',
            };

            const isAttack = msg.category === 'ATTACK_RESPONSE';

            return (
              <div
                key={msg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cat.badge}`}>
                        {cat.label}
                      </span>
                      {msg.district && (
                        <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-red-600" />
                          {msg.district.name}
                        </span>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(msg)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Editar mensaje"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          disabled={isDeletingId === msg.id}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          title="Eliminar mensaje"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{msg.title}</h3>

                  {isAttack ? (
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-emerald-700 block">Réplica Oficial Recomendada:</span>
                      <p className="text-slate-800 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60 leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                      "{msg.content}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Mensaje */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-red-600" />
                <span>{editingMsg ? 'Editar Mensaje / Argumentario' : 'Nuevo Mensaje / Argumentario'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría del Mensaje *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="KEY_MESSAGE">Mensaje Principal de Campaña</option>
                    <option value="ATTACK_RESPONSE">Respuesta a Ataque de Rivales</option>
                    <option value="FAQ">Pregunta Frecuente (FAQ)</option>
                    <option value="LOCAL_DATA">Dato Local Contrastado</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distrito Específico (Opcional)</label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Ámbito Municipal General</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {formData.category === 'ATTACK_RESPONSE' ? 'Ataque Previsible del Rival *' : 'Título o Tema del Mensaje *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.category === 'ATTACK_RESPONSE'
                      ? 'Ej: "Dicen que no tenemos experiencia de gestión"'
                      : 'Ej: Compromiso irrenunciable con la limpieza viaria'
                  }
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {formData.category === 'ATTACK_RESPONSE' ? 'Réplica Oficial Recomendada *' : 'Contenido / Argumentario *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    formData.category === 'ATTACK_RESPONSE'
                      ? 'Desarrolla la respuesta clara, serena y con datos que deben dar los portavoces y militantes...'
                      : 'Redacta el mensaje o argumento tal y como debe ser transmitido a la ciudadanía...'
                  }
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : editingMsg ? 'Guardar Cambios' : 'Crear Mensaje'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
