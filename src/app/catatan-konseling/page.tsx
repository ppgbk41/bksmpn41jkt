'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { FileText, Plus, ShieldAlert, Lock, X } from 'lucide-react';
import StudentSelect from '@/components/common/StudentSelect';

export default function CatatanKonselingPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 WIB',
    location: 'Ruang BK Utama',
    referralSource: 'Mandiri',
    issueCategory: 'Pribadi',
    issueDescription: '',
    issueIdentification: '',
    goals: '',
    techniques: '',
    counselingProcess: '',
    outcome: '',
    agreement: '',
    followUpPlan: '',
    nextMeetingDate: '',
    status: 'Selesai'
  });

  useEffect(() => {
    fetchSessionAndNotes();
  }, []);

  const fetchSessionAndNotes = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/konseling/catatan');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/konseling/catatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchSessionAndNotes();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan catatan konseling');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  const isAuthorized = ['ADMIN', 'GURU_BK'].includes(user?.role);

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Confidential Record</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Catatan Konseling Individu</h1>
            <p className="text-xs text-slate-500 mt-1">
              Rekam jejak proses konseling rahasia peserta didik SMP Negeri 41 Jakarta.
            </p>
          </div>

          {isAuthorized && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <Plus className="w-4 h-4" />
              Input Sesi Konseling Baru
            </button>
          )}
        </div>

        {!isAuthorized ? (
          <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-8 text-center text-red-300 text-xs space-y-2">
            <Lock className="w-8 h-8 text-red-400 mx-auto" />
            <p className="font-bold text-sm">AKSES DITOLAK: DOKUMEN RAHASIA</p>
            <p>Hanya Guru Bimbingan Konseling dan Administrator berwenang yang dapat membaca catatan ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Memuat catatan konseling...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">Belum ada catatan konseling individu.</div>
            ) : (
              sessions.map((s, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-bold text-sm text-red-600 dark:text-red-400">
                        {s.student?.name} ({s.student?.currentClass?.name}) • Sesi #{s.sessionNo}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {s.date} jam {s.time} ({s.location}) • Konselor: {s.bkTeacherName} • Sumber: {s.referralSource}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold rounded-full">
                      {s.issueCategory}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                    <div>
                      <p><strong className="text-slate-900 dark:text-slate-100">Uraian Masalah:</strong> {s.issueDescription}</p>
                      <p className="mt-1"><strong className="text-slate-900 dark:text-slate-100">Identifikasi:</strong> {s.issueIdentification}</p>
                      <p className="mt-1"><strong className="text-blue-500">Tujuan Sesi:</strong> {s.goals}</p>
                    </div>
                    <div>
                      <p><strong className="text-purple-500">Teknik Pendekatan:</strong> {s.techniques}</p>
                      <p className="mt-1"><strong className="text-emerald-500">Hasil & Kesepakatan:</strong> {s.agreement}</p>
                      <p className="mt-1"><strong className="text-amber-500">Rencana Tindak Lanjut:</strong> {s.followUpPlan || '-'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Add Session Note */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Input Catatan Konseling Individu Rahasia</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <StudentSelect
                  value={formData.studentId}
                  onChange={(id) => setFormData({ ...formData, studentId: id })}
                  label="Pilih Peserta Didik (Konseli) *"
                  placeholder="Ketik nama murid, NIS, atau filter kelas (7A-9G)..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sumber Rujukan</label>
                  <select
                    value={formData.referralSource}
                    onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Mandiri">Mandiri</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Teman">Teman</option>
                    <option value="Guru">Guru Mata Pelajaran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori Permasalahan *</label>
                <select
                  value={formData.issueCategory}
                  onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Pribadi">Pribadi</option>
                  <option value="Belajar">Belajar</option>
                  <option value="Sosial">Sosial / Pertemanan</option>
                  <option value="Karier">Karier</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Perundungan">Perundungan</option>
                  <option value="Kedisiplinan">Kedisiplinan</option>
                  <option value="Kehadiran">Kehadiran</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Uraian Singkat Permasalahan *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Teknik & Kesepakatan Konseling</label>
                <textarea
                  rows={2}
                  value={formData.agreement}
                  onChange={(e) => setFormData({ ...formData, agreement: e.target.value })}
                  placeholder="Komitmen dan kesepakatan bersama konseli..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl">Simpan Sesi Rahasia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
