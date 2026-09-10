'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RiasecChartProps {
  classDistribution: Record<string, number>;
}

export default function RiasecChart({ classDistribution }: RiasecChartProps) {
  const data = [
    { name: 'Realistic (R)', count: classDistribution.R || 0, fill: '#ef4444' },
    { name: 'Investigative (I)', count: classDistribution.I || 0, fill: '#3b82f6' },
    { name: 'Artistic (A)', count: classDistribution.A || 0, fill: '#ec4899' },
    { name: 'Social (S)', count: classDistribution.S || 0, fill: '#10b981' },
    { name: 'Enterprising (E)', count: classDistribution.E || 0, fill: '#f59e0b' },
    { name: 'Conventional (C)', count: classDistribution.C || 0, fill: '#8b5cf6' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="border-b pb-3 dark:border-slate-800">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Grafik Distribusi Tipologi Holland RIASEC Per Kelas
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Agregasi kecenderungan pola kepribadian & minat karier peserta didik dalam rombel kelas.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
