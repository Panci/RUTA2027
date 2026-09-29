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

export interface DistrictChartParty {
  acronym: string;
  name?: string;
  colorHex: string;
  isOwnParty: boolean;
}

export default function DistrictCharts({
  data,
  parties = [],
}: {
  data: Array<{ distrito: string; [key: string]: any }>;
  parties?: DistrictChartParty[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
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
            {parties.map((p) => (
              <Bar
                key={p.acronym}
                dataKey={p.acronym}
                name={p.isOwnParty ? `${p.acronym} (Propia)` : p.acronym}
                fill={p.colorHex}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
