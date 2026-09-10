'use client';

import React from 'react';
import { Eye, Headphones, Activity } from 'lucide-react';

interface LearningStyleChartProps {
  distribution: { Visual: number; Auditori: number; Kinestetik: number };
}

export default function LearningStyleChart({ distribution }: LearningStyleChartProps) {
  const total = (distribution.Visual || 0) + (distribution.Auditori || 0) + (distribution.Kinestetik || 0);

  const pctVisual = total > 0 ? Math.round((distribution.Visual / total) * 100) : 0;
  const pctAuditori = total > 0 ? Math.round((distribution.Auditori / total) * 100) : 0;
  const pctKinestetik = total > 0 ? Math.round((distribution.Kinestetik / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="border-b pb-3 dark:border-slate-800">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Ringkasan Preferensi Gaya Belajar Kelas
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Perbandingan proporsi gaya belajar dominan siswa (Visual, Auditori, Kinestetik).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Gaya Belajar Visual</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{distribution.Visual} Siswa</p>
          <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pctVisual}%` }} />
          </div>
          <p className="text-[10px] text-blue-600 font-bold text-right">{pctVisual}% dari Kelas</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Gaya Belajar Auditori</span>
            <Headphones className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-purple-300">{distribution.Auditori} Siswa</p>
          <div className="w-full bg-purple-200 dark:bg-purple-900 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${pctAuditori}%` }} />
          </div>
          <p className="text-[10px] text-purple-600 font-bold text-right">{pctAuditori}% dari Kelas</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Gaya Belajar Kinestetik</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{distribution.Kinestetik} Siswa</p>
          <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pctKinestetik}%` }} />
          </div>
          <p className="text-[10px] text-emerald-600 font-bold text-right">{pctKinestetik}% dari Kelas</p>
        </div>
      </div>
    </div>
  );
}
