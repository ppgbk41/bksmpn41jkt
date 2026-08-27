import React from 'react';
import Link from 'next/link';
import { Home, School, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <School className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            404
          </span>
          <h1 className="text-lg font-bold text-slate-100">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-400">
            Halaman yang Anda tuju tidak tersedia atau telah dipindahkan dalam Sistem Pelayanan BK SMPN 41 Jakarta.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda Utama</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
