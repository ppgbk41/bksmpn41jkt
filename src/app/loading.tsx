import React from 'react';
import { School } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 animate-pulse">
          <School className="w-8 h-8" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-25 pointer-events-none" />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wide">
        Memuat Sistem BK SMPN 41 Jakarta...
      </p>
    </div>
  );
}
