'use client';

import React from 'react';
import { Compass, GraduationCap, BookOpen, Briefcase, Award, Sparkles, CheckCircle2, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { generateComprehensiveRiasecAnalysis, ComprehensiveRiasecAnalysis } from '@/lib/riasec-recommendation';

interface RiasecCardProps {
  scores?: { R: number; I: number; A: number; S: number; E: number; C: number };
  hollandCode?: string;
  studentName?: string;
  className?: string;
  showRoleBadge?: boolean;
}

export default function RiasecRecommendationCard({
  scores,
  hollandCode,
  studentName = 'Peserta Didik',
  className = '',
  showRoleBadge = true
}: RiasecCardProps) {
  // If scores not provided, construct sample default or fallback
  const finalScores = scores || { R: 18, I: 22, A: 15, S: 24, E: 20, C: 19 };

  const analysis: ComprehensiveRiasecAnalysis = generateComprehensiveRiasecAnalysis(finalScores);

  return (
    <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
      {/* Top Banner & Holland Code Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 p-6 rounded-2xl text-white space-y-3 relative overflow-hidden shadow-md">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">Laporan Rekomendasi Karir & Peminatan</span>
              <h2 className="text-xl font-extrabold text-white">Hasil Asesmen Minat RIASEC Holland</h2>
            </div>
          </div>

          <div className="px-4 py-2 bg-purple-500/20 border border-purple-400/40 rounded-2xl backdrop-blur-md text-center shrink-0">
            <span className="text-[10px] text-purple-200 uppercase font-semibold block">Kode Holland Dominan</span>
            <span className="text-2xl font-black tracking-widest text-amber-300">{analysis.hollandCode}</span>
          </div>
        </div>

        {/* Synthesis Summary */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-2 border-t border-purple-500/30">
          {analysis.hollandSynthesisSummary}
        </p>

        {showRoleBadge && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] text-purple-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Informasi ini dapat diakses oleh: <strong>Guru BK, Siswa, Wali Kelas, dan Admin</strong></span>
          </div>
        )}
      </div>

      {/* 6 Holland Dimensions Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Profil Skor 6 Dimensi Kepribadian Holland:</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {analysis.sortedRankings.map((item, idx) => (
            <div
              key={item.code}
              className={`p-3 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-black text-sm ${idx === 0 ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  [{item.code}] {item.name}
                </span>
                {idx === 0 && (
                  <span className="px-1.5 py-0.2 bg-purple-600 text-white text-[9px] font-bold rounded">TOP</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">{item.detail.titleIndo}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${idx === 0 ? 'bg-purple-600' : 'bg-slate-400 dark:bg-slate-500'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                <span>Skor: {item.score}</span>
                <span className="font-bold">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 1: Rekomendasi Peminatan / Penjurusan SMA & SMK */}
      <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b pb-3 border-blue-200 dark:border-blue-800">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              1. Rekomendasi Peminatan & Penjurusan Sekolah Lanjutan (SMA / SMK)
            </h3>
            <p className="text-[11px] text-slate-500">Pilihan alur belajar setelah lulus SMPN 41 Jakarta yang selaras dengan tipe minat</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* SMA Options */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px]">Pilihan SMA</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Jalur & Kelompok Mata Pelajaran</h4>
            </div>

            {analysis.smaSmkRecommendations.smaTracks.map((tr, i) => (
              <div key={i} className="space-y-1 pt-1">
                <p className="font-bold text-blue-700 dark:text-blue-300">{tr.track}</p>
                <div className="flex flex-wrap gap-1">
                  {tr.focusSubjects.map((sub, j) => (
                    <span key={j} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded font-medium text-[10px]">
                      {sub}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-0.5">{tr.rationale}</p>
              </div>
            ))}
          </div>

          {/* SMK Options */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-[10px]">Pilihan SMK</span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Konsentrasi & Keahlian Kejuruan</h4>
            </div>

            <div className="space-y-1.5 pt-1">
              {analysis.smaSmkRecommendations.smkMajors.map((smk, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">{smk.name}</strong>
                    <span className="text-slate-400 ml-1">({smk.rationale})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Rekomendasi Jurusan Perkuliahan (Perguruan Tinggi) */}
      <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b pb-3 border-emerald-200 dark:border-emerald-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              2. Rekomendasi Jurusan Perkuliahan (Perguruan Tinggi PTN / PTS)
            </h3>
            <p className="text-[11px] text-slate-500">Program studi sarjana / diploma yang paling direkomendasikan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {analysis.collegeMajorRecommendations.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs">{item.category}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.majors.map((m, j) => (
                  <span key={j} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold rounded-lg text-[11px]">
                    🎓 {m}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">{item.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Prospek Kerja & Karir Masa Depan */}
      <div className="p-5 bg-gradient-to-br from-amber-50/70 to-orange-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b pb-3 border-amber-200 dark:border-amber-800">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
              3. Prospek Kerja & Karir Masa Depan
            </h3>
            <p className="text-[11px] text-slate-500">Profesi prospektif di dunia kerja modern sesuai potensi kepribadian</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {analysis.careerProspects.map((career, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-100 dark:border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[9px] rounded uppercase">
                  {career.industry}
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-1">{career.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{career.description}</p>
              </div>
              <div className="pt-2 flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                <span>Prospek Karir Utama</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Notes for Guidance */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-[11px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700 dark:text-slate-300">Catatan Pendampingan Guru BK SMPN 41 Jakarta:</p>
        <p>
          Rekomendasi ini disusun secara terintegrasi berdasarkan instrumen Holland RIASEC. Siswa dan Orang Tua/Wali dapat mengkonsultasikan hasil ini secara langsung bersama Guru Bimbingan Konseling dan Wali Kelas untuk memantapkan pilihan sekolah lanjutan.
        </p>
      </div>
    </div>
  );
}
