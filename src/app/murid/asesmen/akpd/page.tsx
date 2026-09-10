'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  BookOpen,
  User,
  Users,
  Compass,
  GraduationCap,
  RefreshCw,
  Check,
  BarChart3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DEFAULT_AKPD_ITEMS } from '@/lib/assessment-data';

export default function MuridAkpdPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>(DEFAULT_AKPD_ITEMS);
  const [existingResult, setExistingResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  // Selected items Set
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<'Pribadi' | 'Sosial' | 'Belajar' | 'Karier'>('Pribadi');
  const [submittedSummary, setSubmittedSummary] = useState<any>(null);

  useEffect(() => {
    fetchAkpdData();
  }, []);

  const fetchAkpdData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/asesmen/akpd');
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        }
        setExistingResult(data.existingSubmission || data.existingResult || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllInCategory = (category: string) => {
    const categoryItemIds = items.filter(i => i.category === category).map(i => i.id);
    const allSelected = categoryItemIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !categoryItemIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...categoryItemIds])));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      const confirmEmpty = confirm('Anda belum memilih satupun butir pernyataan. Apakah Anda yakin tidak memiliki kendala atau kebutuhan pada seluruh 40 butir angket?');
      if (!confirmEmpty) return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/asesmen/akpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedItemIds: selectedIds })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmittedSummary(data.summary);
        setExistingResult(data.submission || data.result);
        setIsRefilling(false);
        alert('🎉 Terima kasih! Jawaban AKPD Anda berhasil dikirim ke Guru BK.');
      } else {
        alert(data.error || 'Gagal mengirim asesmen');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat mengirim data');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { id: 'Pribadi', label: '1. Bidang Pribadi', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Sosial', label: '2. Bidang Sosial', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'Belajar', label: '3. Bidang Belajar', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'Karier', label: '4. Bidang Karier', icon: Compass, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  const currentCategoryItems = items.filter(item => item.category === activeCategory);
  const selectedCountInCategory = currentCategoryItems.filter(i => selectedIds.includes(i.id)).length;

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/murid/asesmen" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Asesmen</span>
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">AKPD Online SMP</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-blue-800/40 text-white shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instrumen Angket Kebutuhan Peserta Didik (ABKIN SMP)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Angket Kebutuhan Peserta Didik (AKPD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pilihlah butir-butir pernyataan di bawah ini yang paling menggambarkan kondisi atau kendala yang sedang Anda hadapi. Jawaban Anda bersifat <strong>rahasia</strong> dan akan membantu Guru BK menyusun bimbingan yang tepat.
          </p>
        </div>

        {/* Jika sudah pernah mengisi dan tidak sedang re-fill */}
        {existingResult && !isRefilling && !submittedSummary && (
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Sudah Terisi
                    </span>
                    <span className="text-xs text-slate-400">
                      Tanggal: {existingResult.createdAt ? new Date(existingResult.createdAt).toLocaleDateString('id-ID') : existingResult.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    Hasil Diagnostik AKPD Anda: {existingResult.dominantResult || existingResult.category}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsRefilling(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Pengisian Ulang AKPD</span>
              </button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                Ringkasan Profil Kebutuhan:
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {existingResult.interpretation}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Rekomendasi Layanan Bimbingan Konseling:
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {existingResult.recommendations}
              </p>
            </div>
          </div>
        )}

        {/* Questionnaire Form View */}
        {(!existingResult || isRefilling || submittedSummary) && (
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const catCount = items.filter(i => i.category === cat.id && selectedIds.includes(i.id)).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : cat.color}`} />
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : catCount > 0
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {catCount} / 10
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{cat.label}</h4>
                      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {catCount > 0 ? `${catCount} butir dipilih` : 'Klik untuk mengisi'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Questions Container */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Pernyataan {activeCategory === 'Pribadi' ? 'Bidang Pribadi' : activeCategory === 'Sosial' ? 'Bidang Sosial' : activeCategory === 'Belajar' ? 'Bidang Belajar' : 'Bidang Karier'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Centang butir di bawah yang Anda rasakan atau butuhkan bantuannya saat ini:
                  </p>
                </div>

                <button
                  onClick={() => selectAllInCategory(activeCategory)}
                  className="text-xs text-blue-600 hover:text-blue-500 font-bold"
                >
                  {selectedCountInCategory === 10 ? 'Batal Pilih Semua' : 'Pilih Semua di Bidang Ini'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {currentCategoryItems.map((item) => {
                  const isChecked = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500 dark:border-blue-700 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/50 scale-105'
                          : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Butir [{item.id}]
                        </span>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          isChecked
                            ? 'font-bold text-blue-950 dark:text-blue-100'
                            : 'text-slate-700 dark:text-slate-300 font-medium'
                        }`}>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step Navigation & Submit Action */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t dark:border-slate-800">
                <div className="text-xs text-slate-500 font-medium">
                  Total Terpilih: <strong className="text-blue-600 text-sm font-bold">{selectedIds.length}</strong> dari 40 butir angket
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeCategory === 'Pribadi' && (
                    <button
                      onClick={() => setActiveCategory('Sosial')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Lanjut ke Bidang Sosial</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {activeCategory === 'Sosial' && (
                    <button
                      onClick={() => setActiveCategory('Belajar')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Lanjut ke Bidang Belajar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {activeCategory === 'Belajar' && (
                    <button
                      onClick={() => setActiveCategory('Karier')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Lanjut ke Bidang Karier</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {activeCategory === 'Karier' && (
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'Sedang Menyimpan...' : 'Kirim Jawaban AKPD ke Guru BK'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
