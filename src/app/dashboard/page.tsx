'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionAndStats();
  }, []);

  const fetchSessionAndStats = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const stData = await statsRes.json();
        setData(stData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm font-semibold">
        Memuat Dashboard Pelayanan BK...
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Top Emergency SOS Bullying Alert Banner (Jika ada kasus aktif/baru) */}
        {data?.activeSosReports && data.activeSosReports.length > 0 && (
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-600/80 rounded-3xl p-5 shadow-2xl text-white relative overflow-hidden ring-4 ring-red-600/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-red-600/50 animate-bounce">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white tracking-wider animate-pulse">
                      🚨 PANGGILAN DARURAT
                    </span>
                    <span className="text-xs text-red-300 font-bold">
                      {data.stats?.activeSosCount} Kasus SOS Bullying Membutuhkan Respon
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    Laporan Perundungan & Kekerasan Masuk
                  </h2>
                  <p className="text-xs text-red-200/90 mt-0.5 max-w-2xl">
                    Laporan terbaru: <b className="text-white">{data.activeSosReports[0].victimName}</b> (Kelas {data.activeSosReports[0].victimClass}) — Kategori: <b>{data.activeSosReports[0].category}</b> ({data.activeSosReports[0].urgencyLevel}).
                  </p>
                </div>
              </div>

              <Link
                href="/sos-bullying"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-red-600/50 shrink-0 transition-transform hover:scale-105"
              >
                <span>Buka Pusat Tanggap Darurat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 border border-blue-800/40 rounded-3xl p-6 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Sistem Pelayanan BK Terintegrasi
              </span>
              <span className="text-xs text-slate-400">Tahun Ajaran 2025/2026</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Selamat Datang, {user?.name}!</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Pusat pengelolaan bimbingan konseling peserta didik SMP Negeri 41 Jakarta. Seluruh catatan konseling dienkripsi dan terlindungi secara rahasia.
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {['ADMIN', 'GURU_BK'].includes(user?.role) && (
              <>
                <Link
                  href="/siswa?action=add"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Murid
                </Link>
                <Link
                  href="/asesmen?action=add"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Input Asesmen
                </Link>
                <Link
                  href="/catatan-konseling?action=add"
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Catatan Sesi
                </Link>
              </>
            )}
            <Link
              href="/laporan"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Laporan
            </Link>
          </div>
        </div>

        {/* 8 Statistic KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Total Peserta Didik</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.totalStudents || 0}</p>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
              <span>Kelas 7: {stats.grade7Count}</span> | <span>Kelas 8: {stats.grade8Count}</span> | <span>Kelas 9: {stats.grade9Count}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Status Asesmen AKPD</span>
              <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{stats.studentsWithAssessment || 0}</p>
            <div className="mt-2 text-[10px] text-slate-400">
              Belum Asesmen: <span className="font-semibold text-amber-500">{stats.studentsWithoutAssessment || 0} murid</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Pendaftaran Baru</span>
              <CalendarCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{stats.newRegistrationsCount || 0}</p>
            <div className="mt-2 text-[10px] text-slate-400">
              Membutuhkan Konfirmasi Jadwal
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Konseling Terjadwal</span>
              <Calendar className="w-4 h-4 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-2">{stats.scheduledCounselingCount || 0}</p>
            <div className="mt-2 text-[10px] text-slate-400">
              Perlu Tindak Lanjut: <span className="font-semibold text-red-400">{stats.followUpRequiredCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Middle Grid: Today's Schedule & Interactive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Counseling Schedule Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Jadwal Konseling Hari Ini</h3>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                {data?.todaySchedules?.length || 0} Sesi
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {!data?.todaySchedules || data.todaySchedules.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  Tidak ada jadwal sesi konseling untuk hari ini.
                </div>
              ) : (
                data.todaySchedules.map((sch: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{sch.studentName}</p>
                      <p className="text-[11px] text-slate-500">{sch.className} • {sch.timeSlot}</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-lg">
                      {sch.location}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Monthly Service Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Layanan Konseling per Bulan</h3>
              <span className="text-xs text-slate-400">2026</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyChartData || []}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="jumlah" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Problem Categories Donut Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Kategori Permasalahan</h3>
              <span className="text-xs text-slate-400">Agregasi</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.problemChartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.problemChartData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Audit Log Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Aktivitas Terbaru Sistem (Audit Log)</h3>
            </div>
            <Link href="/pengaturan" className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua Log <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {!data?.recentActivities || data.recentActivities.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">Belum ada catatan aktivitas.</div>
            ) : (
              data.recentActivities.map((act: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {act.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.userName} <span className="font-normal text-slate-400">({act.userRole})</span>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">{act.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
