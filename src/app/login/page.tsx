'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Lock, User, ShieldCheck, School } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login gagal');
        setLoading(false);
        return;
      }

      if (data.user?.mustChangePassword) {
        router.push('/ganti-password');
      } else if (data.user?.role === 'MURID') {
        router.push('/murid/portal');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10">
        {/* School Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 text-white">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">SMP NEGERI 41 JAKARTA</h1>
          <p className="text-xs text-blue-400 font-medium mt-1">Portal Pelayanan Bimbingan & Konseling</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Login Guru BK & Wali Kelas</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email atau Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="siti.aminah@smp41jkt.sch.id / gurubk"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Memproses...' : 'Masuk Pelayanan BK'}</span>
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 text-center mb-2">Akun Pengujian Demo:</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="font-bold text-blue-300">Guru BK</p>
              <p className="text-slate-400">User: <code className="text-slate-200">gurubk</code></p>
              <p className="text-slate-400">Pass: <code className="text-slate-200">bk123</code></p>
            </div>
            <div className="p-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="font-bold text-emerald-300">Wali Kelas 7A</p>
              <p className="text-slate-400">User: <code className="text-slate-200">walikelas7a</code></p>
              <p className="text-slate-400">Pass: <code className="text-slate-200">wali123</code></p>
            </div>
          </div>
        </div>

        {/* Portal links */}
        <div className="mt-6 flex justify-between text-xs text-slate-400">
          <Link href="/murid/login" className="hover:text-blue-400 transition-colors">Portal Login Murid →</Link>
          <Link href="/admin/login" className="hover:text-amber-400 transition-colors">Portal Admin →</Link>
        </div>
      </div>
    </div>
  );
}
