'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AssessmentFilters from '@/components/asesmen/AssessmentFilters';
import AlertPanel from '@/components/asesmen/AlertPanel';
import AkpdConfigModal from '@/components/asesmen/AkpdConfigModal';
import AkpdRekapTab from '@/components/asesmen/AkpdRekapTab';
import SociogramVisualizer from '@/components/asesmen/SociogramVisualizer';
import RiasecChart from '@/components/asesmen/RiasecChart';
import RiasecRecommendationCard from '@/components/asesmen/RiasecRecommendationCard';
import LearningStyleChart from '@/components/asesmen/LearningStyleChart';
import {
  ClipboardCheck,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  Sparkles,
  BookOpen,
  User,
  Compass,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  HeartHandshake
} from 'lucide-react';

export default function AsesmenPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('Ganjil');
  const [level, setLevel] = useState('');
  const [classId, setClassId] = useState('');

  // Dashboard Data
  const [metrics, setMetrics] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Active Selected Assessment View for Detail Rekap
  const [activeAssessment, setActiveAssessment] = useState<'OVERVIEW' | 'AKPD' | 'RIASEC' | 'SOSIOMETRI' | 'GAYA_BELAJAR' | 'MINAT_BAKAT'>('OVERVIEW');

  // Asesmen specific rekap data states
  const [akpdData, setAkpdData] = useState<any>(null);
  const [riasecData, setRiasecData] = useState<any>(null);
  const [sosiometriData, setSosiometriData] = useState<any>(null);
  const [gayaBelajarData, setGayaBelajarData] = useState<any>(null);
  const [minatBakatData, setMinatBakatData] = useState<any>(null);

  // Modal Config
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear, semester, level, classId]);

  useEffect(() => {
    if (activeAssessment === 'AKPD') fetchAkpdRekap();
    if (activeAssessment === 'RIASEC') fetchRiasecRekap();
    if (activeAssessment === 'SOSIOMETRI') fetchSosiometriRekap();
    if (activeAssessment === 'GAYA_BELAJAR') fetchGayaBelajarRekap();
    if (activeAssessment === 'MINAT_BAKAT') fetchMinatBakatRekap();
  }, [activeAssessment, academicYear, semester, classId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const params = new URLSearchParams({ academicYear, semester });
      if (level) params.append('level', level);
      if (classId) params.append('classId', classId);

      const res = await fetch(`/api/asesmen/dashboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setClasses(data.classes || []);
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAkpdRekap = async () => {
    try {
      const params = new URLSearchParams({ academicYear, semester });
      if (classId) params.append('classId', classId);
      const res = await fetch(`/api/asesmen/akpd?${params.toString()}`);
      if (res.ok) setAkpdData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchRiasecRekap = async () => {
    try {
      const params = new URLSearchParams({ academicYear, semester });
      if (classId) params.append('classId', classId);
      const res = await fetch(`/api/asesmen/riasec?${params.toString()}`);
      if (res.ok) setRiasecData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSosiometriRekap = async () => {
    try {
      const params = new URLSearchParams({ academicYear, semester });
      if (classId) params.append('classId', classId);
      const res = await fetch(`/api/asesmen/sosiometri?${params.toString()}`);
      if (res.ok) setSosiometriData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchGayaBelajarRekap = async () => {
    try {
      const params = new URLSearchParams({ academicYear, semester });
      if (classId) params.append('classId', classId);
      const res = await fetch(`/api/asesmen/gaya-belajar?${params.toString()}`);
      if (res.ok) setGayaBelajarData(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMinatBakatRekap = async () => {
    try {
      const params = new URLSearchParams({ academicYear, semester });
      if (classId) params.append('classId', classId);
      const res = await fetch(`/api/asesmen/minat-bakat?${params.toString()}`);
      if (res.ok) setMinatBakatData(await res.json());
    } catch (e) { console.error(e); }
  };

  const stats = metrics?.completionStats || {};

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header Title & Config Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul Asesmen Diagnostik BK Terintegrasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              Dashboard Asesmen & Profiling Peserta Didik
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengelolaan 5 jenis asesmen, kalkulasi rekapitulasi kelas, penilaian dinamika kelompok, dan sistem alert otomatis.
            </p>
          </div>

          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shrink-0"
            >
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Pengaturan Severity Butir AKPD</span>
            </button>
          )}
        </div>

        {/* Global Filter Bar */}
        <AssessmentFilters
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          semester={semester}
          setSemester={setSemester}
          level={level}
          setLevel={setLevel}
          classId={classId}
          setClassId={setClassId}
          classes={classes}
        />

        {/* 4 Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Total Peserta Didik</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{metrics?.totalStudents || 0}</p>
            <p className="text-[11px] text-slate-400">Siswa aktif sesuai scope filter</p>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <span>Selesai Mengerjakan</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{metrics?.totalCompletedStudents || 0}</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Telah memiliki rekam asesmen</p>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-bold">
              <span>Belum Mengerjakan</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-700 dark:text-amber-300">{metrics?.totalNotCompletedStudents || 0}</p>
            <p className="text-[11px] text-amber-600 font-semibold">Memerlukan pengingat pengisian</p>
          </div>

          <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-red-800 dark:text-red-300 text-xs font-bold">
              <span>Jumlah Alert Aktif</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-black text-red-700 dark:text-red-300">{metrics?.totalAlerts || 0}</p>
            <p className="text-[11px] text-red-600 font-semibold">Memerlukan perhatian Guru BK</p>
          </div>
        </div>

        {/* 5 Assessment Type Cards + Completion Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              5 Modul Asesmen Bimbingan Konseling
            </h3>
            <span className="text-xs text-slate-400">Pilih modul untuk melihat rekapitulasi detail per kelas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { id: 'AKPD', name: 'AKPD', label: 'Angket Kebutuhan', icon: ClipboardCheck, color: 'text-blue-500', stat: stats.AKPD },
              { id: 'RIASEC', name: 'RIASEC', label: 'Minat Holland Code', icon: Compass, color: 'text-purple-500', stat: stats.RIASEC },
              { id: 'MINAT_BAKAT', name: 'Minat & Bakat', label: 'Multiple Intelligences', icon: Award, color: 'text-emerald-500', stat: stats.MINAT_BAKAT },
              { id: 'SOSIOMETRI', name: 'Sosiometri', label: 'Dinamika Sosial', icon: HeartHandshake, color: 'text-rose-500', stat: stats.SOSIOMETRI },
              { id: 'GAYA_BELAJAR', name: 'Gaya Belajar', label: 'Visual, Auditori, Kinestetik', icon: BookOpen, color: 'text-amber-500', stat: stats.GAYA_BELAJAR }
            ].map(m => {
              const Icon = m.icon;
              const isActive = activeAssessment === m.id;
              const completedPct = m.stat?.pct || 0;

              return (
                <button
                  key={m.id}
                  onClick={() => setActiveAssessment(isActive ? 'OVERVIEW' : (m.id as any))}
                  className={`p-4 rounded-3xl border text-left transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : m.color}`} />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {m.stat?.completed || 0} Siswa
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm tracking-tight">{m.name}</h4>
                    <p className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{m.label}</p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Progress</span>
                      <span>{completedPct}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isActive ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <div className={`h-full rounded-full ${isActive ? 'bg-white' : 'bg-blue-600'}`} style={{ width: `${completedPct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assessment Attention Alert Panel */}
        <AlertPanel alerts={alerts} onRefreshAlerts={fetchDashboardData} />

        {/* Detail Rekap View per Assessment */}

        {/* AKPD Detail View */}
        {activeAssessment === 'AKPD' && akpdData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <span>Rekapitulasi Angket Kebutuhan Peserta Didik (AKPD)</span>
              </h3>
              <button onClick={() => setActiveAssessment('OVERVIEW')} className="text-xs text-blue-600 font-bold hover:underline">
                Kembali ke Overview
              </button>
            </div>
            <AkpdRekapTab
              itemAnalysis={akpdData.itemAnalysis || {}}
              items={akpdData.items || []}
              studentSubmissions={akpdData.studentSubmissions || []}
              fieldDistribution={akpdData.fieldDistribution || { Pribadi: 0, Sosial: 0, Belajar: 0, Karier: 0 }}
              topNeedsInClass={akpdData.topNeedsInClass || []}
            />
          </div>
        )}

        {/* RIASEC Detail View */}
        {activeAssessment === 'RIASEC' && riasecData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                <span>Rekapitulasi Tipologi Holland RIASEC & Rekomendasi Peminatan</span>
              </h3>
              <button onClick={() => setActiveAssessment('OVERVIEW')} className="text-xs text-blue-600 font-bold hover:underline">
                Kembali ke Overview
              </button>
            </div>

            <RiasecChart classDistribution={riasecData.classDistribution || {}} />

            {/* List of Individual Student RIASEC Recommendations */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">
                Daftar Rekomendasi Peminatan Per Peserta Didik ({riasecData.studentSubmissions?.length || 0} Siswa)
              </h4>

              {(!riasecData.studentSubmissions || riasecData.studentSubmissions.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs">
                  Belum ada siswa yang menyelesaikan Asesmen RIASEC pada scope filter ini.
                </div>
              ) : (
                <div className="space-y-4">
                  {riasecData.studentSubmissions.map((sub: any) => {
                    let scores;
                    try {
                      scores = JSON.parse(sub.summaryJson || '{}').scores;
                    } catch (e) {}

                    return (
                      <div key={sub.id} className="space-y-3">
                        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-sm text-purple-900 dark:text-purple-200">
                              {sub.student?.name} (Kelas {sub.student?.currentClass?.name})
                            </span>
                            <p className="text-[11px] text-slate-500">
                              NISN: {sub.student?.nisn} • Versi #{sub.version} • {sub.dominantResult}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shrink-0">
                            {sub.dominantResult}
                          </span>
                        </div>

                        <RiasecRecommendationCard
                          scores={scores}
                          hollandCode={sub.dominantResult?.replace('Kode Holland: ', '')}
                          studentName={sub.student?.name}
                          className={sub.student?.currentClass?.name}
                          showRoleBadge={true}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOSIOMETRI Detail View */}
        {activeAssessment === 'SOSIOMETRI' && sosiometriData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <span>Rekapitulasi & Visualisasi Sociogram Sosiometri</span>
              </h3>
              <button onClick={() => setActiveAssessment('OVERVIEW')} className="text-xs text-blue-600 font-bold hover:underline">
                Kembali ke Overview
              </button>
            </div>
            <SociogramVisualizer
              classStudents={sosiometriData.classStudents || []}
              analysis={sosiometriData.analysis || { matrix: {}, choiceCounts: {}, mutualPairs: [], starStudents: [], isolatedStudents: [] }}
            />
          </div>
        )}

        {/* GAYA BELAJAR Detail View */}
        {activeAssessment === 'GAYA_BELAJAR' && gayaBelajarData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Rekapitulasi Preferensi Gaya Belajar</span>
              </h3>
              <button onClick={() => setActiveAssessment('OVERVIEW')} className="text-xs text-blue-600 font-bold hover:underline">
                Kembali ke Overview
              </button>
            </div>
            <LearningStyleChart distribution={gayaBelajarData.classDistribution || { Visual: 0, Auditori: 0, Kinestetik: 0 }} />
          </div>
        )}
      </div>

      {/* Modal Pengaturan Severity AKPD */}
      <AkpdConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </MainLayout>
  );
}
