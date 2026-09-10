'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ArrowLeft, Compass, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { DEFAULT_RIASEC_ITEMS } from '@/lib/assessment-data';
import RiasecRecommendationCard from '@/components/asesmen/RiasecRecommendationCard';

export default function MuridRiasecPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  // Scores state: { R01: 4, R02: 5, ... }
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) setUser((await sessionRes.json()).user);

      const res = await fetch('/api/asesmen/riasec');
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

  const handleRatingChange = (id: string, val: number) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async () => {
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < DEFAULT_RIASEC_ITEMS.length) {
      alert(`Mohon jawab seluruh ${DEFAULT_RIASEC_ITEMS.length} butir pernyataan (${totalAnswered} terjawab).`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/asesmen/riasec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      if (res.ok) {
        setExistingSubmission(data.submission);
        alert('🎉 Asesmen RIASEC Holland berhasil disimpan!');
      } else {
        alert(data.error || 'Gagal menyimpan hasil RIASEC');
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
          <span className="text-slate-700 dark:text-slate-300 font-bold">RIASEC Holland Code</span>
        </div>

        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Tipologi Kepribadian & Minat Karier Holland</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Asesmen Minat RIASEC</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Berikan nilai sejauh mana setiap pernyataan di bawah ini sesuai dengan kepribadian dan minat Anda (Skala 1 = Sangat Tidak Sesuai, hingga 5 = Sangat Sesuai).
          </p>
        </div>

        {existingSubmission && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Asesmen RIASEC Terakhir Disimpan pada versi #{existingSubmission.version} ({existingSubmission.academicYear} - {existingSubmission.semester})
                </span>
              </div>
              <button onClick={() => setExistingSubmission(null)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Isi Ulang Asesmen</span>
              </button>
            </div>

            <RiasecRecommendationCard
              scores={(() => {
                try {
                  return JSON.parse(existingSubmission.summaryJson || '{}').scores;
                } catch (e) {
                  return undefined;
                }
              })()}
              hollandCode={existingSubmission.dominantResult?.replace('Kode Holland: ', '')}
              studentName={user?.name}
              showRoleBadge={true}
            />
          </div>
        )}

        {!existingSubmission && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              {DEFAULT_RIASEC_ITEMS.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Pernyataan #{idx + 1} ({item.category})</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">{item.text}</p>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] text-slate-400 font-semibold mr-2">Tidak Sesuai</span>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleRatingChange(item.id, val)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                          answers[item.id] === val
                            ? 'bg-purple-600 text-white shadow-md scale-105'
                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="text-[10px] text-slate-400 font-semibold ml-2">Sangat Sesuai</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center border-t dark:border-slate-800">
              <span className="text-xs text-slate-500 font-semibold">
                Terjawab: {Object.keys(answers).length} dari {DEFAULT_RIASEC_ITEMS.length} Butir
              </span>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Kirim Jawaban RIASEC'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
