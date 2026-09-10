'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ArrowLeft, HeartHandshake, ShieldCheck, Send, CheckCircle2, RefreshCw } from 'lucide-react';

export default function MuridSosiometriPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classmates, setClassmates] = useState<any[]>([]);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  // Choices state
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [choice3, setChoice3] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) setUser((await sessionRes.json()).user);

      const res = await fetch('/api/asesmen/sosiometri');
      if (res.ok) {
        const data = await res.json();
        setClassmates(data.classmates || []);
        setExistingSubmission(data.existingSubmission || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!choice1) {
      alert('Mohon pilih minimal Pilihan 1 teman sekelas.');
      return;
    }

    const choicesPayload = [
      { toStudentId: choice1, choiceOrder: 1, criterion: 'Belajar Kelompok' },
      choice2 ? { toStudentId: choice2, choiceOrder: 2, criterion: 'Belajar Kelompok' } : null,
      choice3 ? { toStudentId: choice3, choiceOrder: 3, criterion: 'Belajar Kelompok' } : null
    ].filter(Boolean);

    try {
      setSubmitting(true);
      const res = await fetch('/api/asesmen/sosiometri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choices: choicesPayload })
      });

      const data = await res.json();
      if (res.ok) {
        setExistingSubmission(data.submission);
        alert('🎉 Terima kasih! Pilihan sosiometri Anda telah tersimpan secara rahasia untuk Guru BK.');
      } else {
        alert(data.error || 'Gagal menyimpan pilihan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/murid/asesmen" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Asesmen</span>
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">Asesmen Sosiometri</span>
        </div>

        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Instrumen Pilihan Sosial & Relasi Sekelas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Asesmen Sosiometri Teman Sekelas</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pilihlah teman sekelas yang paling Anda harapkan untuk diajak bekerja sama dalam kegiatan belajar kelompok atau aktivitas kelas.
          </p>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="font-semibold">
            <strong>Privasi Dijamin:</strong> Pilihan Anda hanya akan digunakan oleh Guru BK untuk memandu dinamika kelas secara positif dan <strong>tidak akan ditampilkan kepada teman lain</strong>.
          </p>
        </div>

        {existingSubmission && (
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Pilihan Sosiometri Anda Telah Terdaftar
                </h3>
              </div>
              <button onClick={() => setExistingSubmission(null)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ubah Pilihan</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">Pilihan tersimpan dengan aman untuk analisis dinamika kelompok Guru BK.</p>
          </div>
        )}

        {!existingSubmission && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  1. Teman Sekelas Pilihan Utamamu (Prioritas Ke-1) *
                </label>
                <select
                  value={choice1}
                  onChange={(e) => setChoice1(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Pilih Teman Sekelas (Pilihan 1) --</option>
                  {classmates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (NISN: {c.nisn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  2. Teman Sekelas Pilihan Kedua (Prioritas Ke-2)
                </label>
                <select
                  value={choice2}
                  onChange={(e) => setChoice2(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Pilih Teman Sekelas (Pilihan 2) --</option>
                  {classmates.filter(c => c.id !== choice1).map(c => (
                    <option key={c.id} value={c.id}>{c.name} (NISN: {c.nisn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  3. Teman Sekelas Pilihan Ketiga (Prioritas Ke-3)
                </label>
                <select
                  value={choice3}
                  onChange={(e) => setChoice3(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- Pilih Teman Sekelas (Pilihan 3) --</option>
                  {classmates.filter(c => c.id !== choice1 && c.id !== choice2).map(c => (
                    <option key={c.id} value={c.id}>{c.name} (NISN: {c.nisn})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t dark:border-slate-800">
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Kirim Pilihan Sosiometri'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
