'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  ClipboardCheck,
  Compass,
  Award,
  HeartHandshake,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function MuridPortalAsesmenPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      // Check status of 5 assessments
      const [akpdRes, riasecRes, minatRes, sosioRes, gayaRes] = await Promise.all([
        fetch('/api/asesmen/akpd'),
        fetch('/api/asesmen/riasec'),
        fetch('/api/asesmen/minat-bakat'),
        fetch('/api/asesmen/sosiometri'),
        fetch('/api/asesmen/gaya-belajar')
      ]);

      const newStatuses: Record<string, boolean> = {};

      if (akpdRes.ok) {
        const data = await akpdRes.json();
        newStatuses.akpd = !!(data.existingSubmission || data.existingResult);
      }
      if (riasecRes.ok) {
        const data = await riasecRes.json();
        newStatuses.riasec = !!data.existingSubmission;
      }
      if (minatRes.ok) {
        const data = await minatRes.json();
        newStatuses.minatBakat = !!data.existingSubmission;
      }
      if (sosioRes.ok) {
        const data = await sosioRes.json();
        newStatuses.sosiometri = !!data.existingSubmission;
      }
      if (gayaRes.ok) {
        const data = await gayaRes.json();
        newStatuses.gayaBelajar = !!data.existingSubmission;
      }

      setStatuses(newStatuses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const assessments = [
    {
      id: 'akpd',
      title: 'Angket Kebutuhan Peserta Didik (AKPD)',
      desc: 'Pemetaan 40 butir instrumen bidang Pribadi, Sosial, Belajar, dan Karier.',
      icon: ClipboardCheck,
      color: 'bg-blue-600',
      href: '/murid/asesmen/akpd',
      isCompleted: !!statuses.akpd
    },
    {
      id: 'riasec',
      title: 'Asesmen Minat Holland (RIASEC)',
      desc: 'Evaluasi 6 tipe kecenderungan kepribadian & karir (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).',
      icon: Compass,
      color: 'bg-purple-600',
      href: '/murid/asesmen/riasec',
      isCompleted: !!statuses.riasec
    },
    {
      id: 'minat-bakat',
      title: 'Asesmen Minat & Bakat',
      desc: 'Pemetaan potensi kecerdasan majemuk (Multiple Intelligences).',
      icon: Award,
      color: 'bg-emerald-600',
      href: '/murid/asesmen/minat-bakat',
      isCompleted: !!statuses.minatBakat
    },
    {
      id: 'sosiometri',
      title: 'Asesmen Sosiometri Teman Sekelas',
      desc: 'Pilihan hubungan sosial & kelompok belajar sekelas (Strictly Confidential Guru BK).',
      icon: HeartHandshake,
      color: 'bg-rose-600',
      href: '/murid/asesmen/sosiometri',
      isCompleted: !!statuses.sosiometri
    },
    {
      id: 'gaya-belajar',
      title: 'Asesmen Preferensi Gaya Belajar',
      desc: 'Mengetahui kombinasi tipe belajar Visual, Auditori, atau Kinestetik.',
      icon: BookOpen,
      color: 'bg-amber-600',
      href: '/murid/asesmen/gaya-belajar',
      isCompleted: !!statuses.gayaBelajar
    }
  ];

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/murid/portal" className="hover:text-blue-600 flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Murid</span>
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-bold">Portal Asesmen BK</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instrumen Asesmen Mandiri Peserta Didik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Asesmen Bimbingan & Konseling Online</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Silakan selesaikan 5 instrumen asesmen di bawah ini. Hasil asesmen Anda akan terintegrasi langsung ke profil bimbingan konseling Anda.
          </p>
        </div>

        {/* Assessment Cards List */}
        <div className="space-y-3">
          {assessments.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-blue-400"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl ${item.color} text-white shadow-md shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{item.title}</h3>
                      {item.isCompleted ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Selesai
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Belum Diisi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <Link
                  href={item.href}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shrink-0 transition-transform active:scale-95 ${
                    item.isCompleted
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <span>{item.isCompleted ? 'Lihat / Perbarui Hasil' : 'Mulai Pengerjaan'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
