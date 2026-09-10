'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, CheckCircle, Clock, ShieldAlert, ArrowRight, X, Phone, UserCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export interface AssessmentAlertItem {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    nisn: string;
    phone?: string;
    parentPhone?: string;
    currentClass?: { name: string };
  };
  assessmentType: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'monitoring' | string;
  status: 'new' | 'viewed' | 'follow_up' | 'resolved' | string;
  notes?: string;
  createdAt: string;
}

interface AlertPanelProps {
  alerts: AssessmentAlertItem[];
  onRefreshAlerts: () => void;
}

export default function AlertPanel({ alerts, onRefreshAlerts }: AlertPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<AssessmentAlertItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await fetch('/api/asesmen/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: newStatus, notes: notesInput })
      });

      if (res.ok) {
        setSelectedAlert(null);
        setNotesInput('');
        onRefreshAlerts();
      } else {
        alert('Gagal memperbarui status alert');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'high') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>Tinggi (Perhatian)</span>
        </span>
      );
    }
    if (severity === 'medium') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          <span>Sedang (Peninjauan)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
        Pemantauan
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">Baru</span>;
      case 'viewed':
        return <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">Dilihat</span>;
      case 'follow_up':
        return <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">Tindak Lanjut</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">Selesai</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Panel Siswa Memerlukan Perhatian Guru BK
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar alert hasil diagnostik asesmen yang terindikasi membutuhkan tindak lanjut konseling.
          </p>
        </div>
        <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-full text-xs font-bold shrink-0">
          {alerts.length} Alert Aktif
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-slate-400 text-xs space-y-1">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
          <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada alert hasil asesmen aktif saat ini.</p>
          <p className="text-[11px]">Seluruh hasil asesmen berada pada tingkat kebutuhan normal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                al.severity === 'high'
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                  : 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(al.severity)}
                    {getStatusBadge(al.status)}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1.5">
                    {al.student?.name} ({al.student?.currentClass?.name})
                  </h4>
                  <p className="text-[11px] text-slate-500">NISN: {al.student?.nisn}</p>
                </div>
              </div>

              <div className="text-xs space-y-1 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{al.title}</span>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed whitespace-pre-line">
                  {al.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setSelectedAlert(al);
                    setNotesInput(al.notes || '');
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tinjau & Tindak Lanjut</span>
                </button>

                <Link
                  href={`/catatan-konseling?studentId=${al.studentId}`}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Buka Konseling</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tinjau Alert */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Detail Alert Asesmen Siswa
                </h3>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">{selectedAlert.student?.name}</span>
                <p className="text-slate-500">Kelas: {selectedAlert.student?.currentClass?.name} • NISN: {selectedAlert.student?.nisn}</p>
                {selectedAlert.student?.parentPhone && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" />
                    <span>HP Ortu: {selectedAlert.student.parentPhone}</span>
                  </p>
                )}
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  <span className="text-[10px] text-slate-400 font-bold">Asesmen: {selectedAlert.assessmentType}</span>
                </div>
                <h4 className="font-bold text-red-950 dark:text-red-200 mt-1">{selectedAlert.title}</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedAlert.description}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Tindak Lanjut Guru BK:</label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Catatan penanganan atau hasil wawancara singkat..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Ubah Status Alert:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'viewed')}
                    className="py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Set Dilihat</span>
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'follow_up')}
                    className="py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tindak Lanjut</span>
                  </button>

                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'resolved')}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesai (Resolved)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
