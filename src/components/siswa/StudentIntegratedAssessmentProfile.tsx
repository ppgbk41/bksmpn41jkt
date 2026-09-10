'use client';

import React, { useState } from 'react';
import { ShieldAlert, Compass, ClipboardCheck, HeartHandshake, BookOpen, Award, History, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import RiasecRecommendationCard from '@/components/asesmen/RiasecRecommendationCard';

interface IntegratedProfileProps {
  student: any;
  userRole: string;
}

export default function StudentIntegratedAssessmentProfile({ student, userRole }: IntegratedProfileProps) {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const submissions = student.assessmentSubmissions || [];
  const alerts = student.assessmentAlerts || [];
  const activeAlerts = alerts.filter((a: any) => ['new', 'viewed', 'follow_up'].includes(a.status));

  // Filter submissions by academic year & semester
  const filteredSubmissions = submissions.filter((sub: any) => {
    const matchYear = selectedAcademicYear === 'all' || sub.academicYear === selectedAcademicYear;
    const matchSem = selectedSemester === 'all' || sub.semester === selectedSemester;
    return matchYear && matchSem;
  });

  // Extract latest assessment results per type
  const latestAkpd = submissions.find((s: any) => s.assessmentType === 'AKPD');
  const latestRiasec = submissions.find((s: any) => s.assessmentType === 'RIASEC');
  const latestMinat = submissions.find((s: any) => s.assessmentType === 'MINAT_BAKAT');
  const latestSosio = submissions.find((s: any) => s.assessmentType === 'SOSIOMETRI');
  const latestGaya = submissions.find((s: any) => s.assessmentType === 'GAYA_BELAJAR');

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <h4 className="font-extrabold text-sm text-red-950 dark:text-red-200">
              Perhatian Guru BK ({activeAlerts.length} Alert Aktif):
            </h4>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((al: any) => (
              <div key={al.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/40 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-red-700 dark:text-red-300">{al.title}</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase">{al.status}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{al.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrated 5-Assessment Summary Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2 dark:border-slate-800">
          Ringkasan Profil Asesmen Terintegrasi ({student.name})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* AKPD Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>AKPD Kebutuhan</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{latestAkpd ? `${latestAkpd.academicYear} ${latestAkpd.semester}` : 'Belum diisi'}</span>
            </div>
            <p className="font-black text-sm text-slate-900 dark:text-slate-100">{latestAkpd?.dominantResult || 'Belum Mengerjakan'}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{latestAkpd?.interpretation || '-'}</p>
          </div>

          {/* RIASEC Card */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Minat Holland Code</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{latestRiasec ? `${latestRiasec.academicYear} ${latestRiasec.semester}` : 'Belum diisi'}</span>
            </div>
            <p className="font-black text-sm text-purple-700 dark:text-purple-300">{latestRiasec?.dominantResult || 'Belum Mengerjakan'}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{latestRiasec?.interpretation || '-'}</p>
          </div>

          {/* Full Detailed RIASEC Recommendation Engine Display */}
          {latestRiasec && (
            <div className="pt-4">
              <RiasecRecommendationCard
                scores={(() => {
                  try {
                    return JSON.parse(latestRiasec.summaryJson || '{}').scores;
                  } catch (e) {
                    return undefined;
                  }
                })()}
                hollandCode={latestRiasec.dominantResult?.replace('Kode Holland: ', '')}
                studentName={student.name}
                showRoleBadge={true}
              />
            </div>
          )}

          {/* Minat & Bakat Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Minat & Bakat (Multiple Int.)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{latestMinat ? `${latestMinat.academicYear} ${latestMinat.semester}` : 'Belum diisi'}</span>
            </div>
            <p className="font-black text-sm text-emerald-700 dark:text-emerald-300">{latestMinat?.dominantResult || 'Belum Mengerjakan'}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{latestMinat?.interpretation || '-'}</p>
          </div>

          {/* Sosiometri Card (Guru BK view only) */}
          {['ADMIN', 'GURU_BK'].includes(userRole) && (
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-rose-600" />
                  <span>Sosiometri Relasi Sekelas</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{latestSosio ? `${latestSosio.academicYear} ${latestSosio.semester}` : 'Belum diisi'}</span>
              </div>
              <p className="font-black text-sm text-rose-700 dark:text-rose-300">{latestSosio?.dominantResult || 'Belum Mengerjakan'}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{latestSosio?.interpretation || '-'}</p>
            </div>
          )}

          {/* Gaya Belajar Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Gaya Belajar</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{latestGaya ? `${latestGaya.academicYear} ${latestGaya.semester}` : 'Belum diisi'}</span>
            </div>
            <p className="font-black text-sm text-amber-700 dark:text-amber-300">{latestGaya?.dominantResult || 'Belum Mengerjakan'}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{latestGaya?.interpretation || '-'}</p>
          </div>
        </div>
      </div>

      {/* Assessment History Timeline Filter */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Histori & Perkembangan Asesmen Antar-Semester
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-bold"
            >
              <option value="all">Semua Tahun Ajaran</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none font-bold"
            >
              <option value="all">Semua Semester</option>
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs">
            Belum ada histori pengerjaan asesmen untuk filter semester/tahun ajaran ini.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {filteredSubmissions.map((sub: any, idx: number) => (
              <div key={sub.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{sub.assessmentType}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded text-[10px]">
                        Versi #{sub.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      TA: {sub.academicYear} • Semester {sub.semester} • Tanggal: {new Date(sub.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg">
                    {sub.dominantResult}
                  </span>
                </div>

                <p><strong className="text-slate-700 dark:text-slate-300">Interpretasi:</strong> {sub.interpretation}</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Rekomendasi Layanan BK:</strong> {sub.recommendations}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
