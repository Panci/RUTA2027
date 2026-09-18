'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  distrito: string;
  AVANZA: number;
  PP: number;
  PSOE: number;
  VOX: number;
}

export default function DistrictCharts({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Comparativa Gráfica de Votos por Distrito</h3>
          <p className="text-xs text-slate-500">Distribución territorial de las principales candidaturas en 2023.</p>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="distrito" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                border: 'none',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="AVANZA" name="Avanza (Propia)" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PP" name="PP" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="PSOE" name="PSOE" fill="#dc2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="VOX" name="VOX" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
