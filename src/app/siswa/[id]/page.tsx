'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  User,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Clock,
  ShieldAlert,
  Printer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  Lock
} from 'lucide-react';

export default function DetailSiswaPage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [canViewConfidential, setCanViewConfidential] = useState(false);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch(`/api/siswa/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setCanViewConfidential(data.canViewConfidential);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm font-semibold">
        Memuat Profil Terintegrasi Peserta Didik...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white text-sm gap-4">
        <p>Peserta Didik tidak ditemukan.</p>
        <Link href="/siswa" className="px-4 py-2 bg-blue-600 rounded-xl text-xs">Kembali ke Daftar Siswa</Link>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Back Link & Header Badge */}
        <div className="flex items-center justify-between">
          <Link href="/siswa" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-500 font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Daftar Peserta Didik
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
              Kelas {student.currentClass?.name}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">
              NISN: {student.nisn}
            </span>
          </div>
        </div>

        {/* Integrated Profile Top Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-bold text-3xl flex items-center justify-center shadow-xl shrink-0">
            {student.name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{student.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">NIS: {student.nis} • Gender: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-semibold">
                Status: {student.status}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px]">
                {student.assessmentResults?.length || 0} Hasil Asesmen
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[11px]">
                {student.sessions?.length || 0} Catatan Sesi Konseling
              </span>
            </div>
          </div>
        </div>

        {/* 5 Integrated Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {[
            { id: 'A', label: 'Data Pribadi & Orang Tua', icon: User },
            { id: 'B', label: 'Akademik & Riwayat Kelas', icon: GraduationCap },
            { id: 'C', label: 'Hasil Asesmen', icon: ClipboardCheck },
            { id: 'D', label: 'Catatan Konseling (RAHASIA)', icon: FileText, confidential: true },
            { id: 'E', label: 'Tindak Lanjut', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isConf = tab.confidential;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {isConf && (
                  <span className="px-1.5 py-0.5 rounded bg-red-900 text-red-200 text-[9px]">
                    Confidential
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}

        {/* TAB A: Data Pribadi & Ortu */}
        {activeTab === 'A' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">Informasi Biodata Lengkap</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <p><span className="text-slate-400">Tempat, Tanggal Lahir:</span> <strong className="text-slate-800 dark:text-slate-200">{student.birthPlace}, {student.birthDate}</strong></p>
                <p><span className="text-slate-400">Agama:</span> <strong className="text-slate-800 dark:text-slate-200">{student.religion}</strong></p>
                <p><span className="text-slate-400">Alamat Tempat Tinggal:</span> <strong className="text-slate-800 dark:text-slate-200">{student.address}</strong></p>
                <p><span className="text-slate-400">Nomor Telepon Siswa:</span> <strong className="text-slate-800 dark:text-slate-200">{student.phone}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong className="text-slate-800 dark:text-slate-200">{student.email}</strong></p>
              </div>
              <div className="space-y-2">
                <p><span className="text-slate-400">Nama Ayah Kandung:</span> <strong className="text-slate-800 dark:text-slate-200">{student.fatherName}</strong></p>
                <p><span className="text-slate-400">Nama Ibu Kandung:</span> <strong className="text-slate-800 dark:text-slate-200">{student.motherName}</strong></p>
                <p><span className="text-slate-400">Pekerjaan Orang Tua:</span> <strong className="text-slate-800 dark:text-slate-200">{student.parentJob}</strong></p>
                <p><span className="text-slate-400">Telepon Orang Tua / Wali:</span> <strong className="text-slate-800 dark:text-slate-200">{student.parentPhone}</strong></p>
                <p><span className="text-slate-400">Catatan Khusus:</span> <strong className="text-slate-800 dark:text-slate-200">{student.notes || '-'}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: Akademik & Riwayat Kelas */}
        {activeTab === 'B' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">Riwayat Kenaikan & Kualifikasi Kelas</h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200">Kelas Saat Ini (2025/2026): {student.currentClass?.name}</p>
                  <p className="text-blue-700 dark:text-blue-400 mt-0.5">Wali Kelas: {student.currentClass?.teacherName || 'Drs. Supriadi'}</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold">Aktif</span>
              </div>

              <h4 className="font-semibold text-slate-700 dark:text-slate-300 pt-2">Rekam Jejak Kenaikan Kelas Sebelumnya:</h4>
              {!student.classHistories || student.classHistories.length === 0 ? (
                <p className="text-slate-400">Belum ada riwayat kelas sebelumnya (Murid Tingkat VII Baru).</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {student.classHistories.map((h: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Tahun Ajaran {h.academicYear}</span>
                        <span className="ml-3 text-slate-500">Kelas {h.className}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-[10px] font-bold rounded">
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB C: Hasil Asesmen */}
        {activeTab === 'C' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Hasil Asesmen Kebutuhan & Psikologis</h3>
              {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                <Link href={`/asesmen?studentId=${student.id}`} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1">
                  + Input Hasil Asesmen
                </Link>
              )}
            </div>

            {!student.assessmentResults || student.assessmentResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Peserta didik belum memiliki data hasil asesmen.</div>
            ) : (
              <div className="space-y-4">
                {student.assessmentResults.map((as: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">{as.assessmentName}</h4>
                        <p className="text-[10px] text-slate-400">Tanggal Pelaksanaan: {as.date} • Konselor: {as.bkTeacherName}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold rounded-lg">
                        Kategori: {as.category} {as.score ? `(${as.score})` : ''}
                      </span>
                    </div>
                    <p><strong className="text-slate-700 dark:text-slate-300">Interpretasi:</strong> {as.interpretation}</p>
                    {as.attentionAreas && <p><strong className="text-amber-600">Area Perhatian:</strong> {as.attentionAreas}</p>}
                    <p><strong className="text-emerald-600">Rekomendasi Layanan BK:</strong> {as.recommendations}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB D: Catatan Konseling (CONFIDENTIAL) */}
        {activeTab === 'D' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Catatan Konseling Individu (Strict Confidentiality)</h3>
              </div>
              {canViewConfidential && (
                <Link href={`/catatan-konseling?studentId=${student.id}`} className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1">
                  + Sesi Baru
                </Link>
              )}
            </div>

            {!canViewConfidential ? (
              <div className="p-8 text-center bg-red-950/20 border border-red-900/40 rounded-2xl text-red-300 text-xs flex flex-col items-center gap-2">
                <Lock className="w-6 h-6 text-red-400" />
                <p className="font-bold">Akses Terbatas: Catatan Konseling Rahasia Guru BK</p>
                <p className="text-[11px] text-red-400">Sesuai standar etika BK, rekam konseling individu hanya dapat dilihat oleh Guru BK & Administrator.</p>
              </div>
            ) : !student.sessions || student.sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Belum ada rekam sesi konseling individu.</div>
            ) : (
              <div className="space-y-4">
                {student.sessions.map((ses: any, idx: number) => (
                  <div key={idx} className="p-5 bg-red-950/10 border border-red-900/30 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-red-900/30 pb-2">
                      <div>
                        <span className="font-bold text-sm text-red-400">Sesi #{ses.sessionNo} • Kategori {ses.issueCategory}</span>
                        <p className="text-[10px] text-slate-400">{ses.date} jam {ses.time} WIB ({ses.location}) • Sumber: {ses.referralSource}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-red-900/60 text-red-200 text-[10px] font-bold rounded-full border border-red-700">
                        {ses.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      <p><strong className="text-red-300">Uraian Masalah:</strong> {ses.issueDescription}</p>
                      <p><strong className="text-slate-200">Identifikasi:</strong> {ses.issueIdentification}</p>
                      <p><strong className="text-blue-400">Tujuan Sesi:</strong> {ses.goals}</p>
                      <p><strong className="text-purple-400">Teknik Digunakan:</strong> {ses.techniques}</p>
                      <p><strong className="text-emerald-400">Kesepakatan Konseli:</strong> {ses.agreement}</p>
                      {ses.nextMeetingDate && <p><strong className="text-amber-400">Jadwal Sesi Selanjutnya:</strong> {ses.nextMeetingDate}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB E: Tindak Lanjut */}
        {activeTab === 'E' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">Pemantauan & Rencana Tindak Lanjut</h3>
            {!student.followUps || student.followUps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Tidak ada agenda tindak lanjut aktif.</div>
            ) : (
              <div className="space-y-3 text-xs">
                {student.followUps.map((fl: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{fl.type}</p>
                      <p className="text-[10px] text-slate-400">Jadwal: {fl.scheduleDate} • Pihak Terlibat: {fl.involvedParties}</p>
                      {fl.monitoringResult && <p className="mt-1 text-slate-600 dark:text-slate-300">Hasil: {fl.monitoringResult}</p>}
                    </div>
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 text-[10px] font-bold rounded-lg">
                      {fl.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
