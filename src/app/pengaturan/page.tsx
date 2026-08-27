'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Settings, ShieldCheck, Activity, Database, Lock } from 'lucide-react';

export default function PengaturanPage() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.recentActivities || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pengaturan Sistem & Audit Log Aktivitas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail keamanan dan konfigurasi Sistem Pelayanan Bimbingan dan Konseling SMPN 41 Jakarta.
          </p>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Keamanan Data Catatan Sesi
            </div>
            <p className="text-slate-500">Bcrypt Hashing + Dynamic Role Scoping Aktif.</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Database className="w-4 h-4" />
              Mesin Database Relasional
            </div>
            <p className="text-slate-500">Prisma ORM dengan Relasi Foreign Keys Terintegrasi.</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <Activity className="w-4 h-4" />
              Audit Log System
            </div>
            <p className="text-slate-500">Pencatatan real-time pengaksesan dokumen rahasia.</p>
          </div>
        </div>

        {/* Activity Audit Log List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">Audit Log Aktivitas Terakhir</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {logs.map((log, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{log.userName} ({log.userRole})</p>
                  <p className="text-slate-500">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
