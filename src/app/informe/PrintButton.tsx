'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow flex items-center gap-2"
    >
      <Printer className="w-4 h-4" />
      Imprimir / Guardar en PDF
    </button>
  );
}
