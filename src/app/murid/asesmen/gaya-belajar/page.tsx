'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Send, CheckCircle2, RefreshCw, Check } from 'lucide-react';
import { DEFAULT_GAYA_BELAJAR_ITEMS } from '@/lib/assessment-data';

export default function MuridGayaBelajarPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) setUser((await sessionRes.json()).user);

      const res = await fetch('/api/asesmen/gaya-belajar');
      if (res.ok) {
        const data = await res.json();
        setExistingSubmission(data.existingSubmission || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      alert('Mohon pilih setidaknya satu pernyataan yang paling menggambarkan kebiasaan belajar Anda.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/asesmen/gaya-belajar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedItemIds: selectedIds })
      });

      const data = await res.json();
      if (res.ok) {
        setExistingSubmission(data.submission);
        alert('🎉 Asesmen Gaya Belajar berhasil disimpan!');
      } else {
        alert(data.error || 'Gagal menyimpan hasil');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/murid/asesmen" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Asesmen</span>
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">Gaya Belajar</span>
        </div>

        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Instrumen Profil Preferensi Gaya Belajar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Asesmen Gaya Belajar</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Centang pernyataan di bawah ini yang paling sesuai dengan kebiasaan dan kenyamanan belajar Anda sehari-hari.
          </p>
        </div>

        {existingSubmission && (
          <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Preferensi Belajar Anda: {existingSubmission.dominantResult}
                </h3>
              </div>
              <button onClick={() => setExistingSubmission(null)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Isi Ulang</span>
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {existingSubmission.interpretation}
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <strong>Saran Belajar:</strong> {existingSubmission.recommendations}
            </div>
          </div>
        )}

        {!existingSubmission && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="space-y-2.5">
              {DEFAULT_GAYA_BELAJAR_ITEMS.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-amber-600 text-white' : 'border-2 border-slate-300 bg-white dark:bg-slate-800'
                    }`}>
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">[{item.category}]</span>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-between items-center border-t dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-500">
                Total Terpilih: <strong className="text-amber-600 font-bold">{selectedIds.length}</strong> Butir
              </span>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Kirim Jawaban Gaya Belajar'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
