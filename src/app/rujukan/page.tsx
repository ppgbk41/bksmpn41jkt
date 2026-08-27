'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Share2, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import StudentSelect from '@/components/common/StudentSelect';

export default function RujukanWaliKelasPage() {
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    reason: '',
    observedCondition: '',
    actionsTaken: 'Telah diajak bicara singkat oleh Wali Kelas',
    priority: 'Normal',
    notes: ''
  });

  useEffect(() => {
    fetchSessionAndReferrals();
  }, []);

  const fetchSessionAndReferrals = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/rujukan');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
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
      const res = await fetch('/api/rujukan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchSessionAndReferrals();
      } else {
        alert('Gagal mengirimkan rujukan');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Formulir & Inbox Rujukan Wali Kelas</h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengajuan rujukan penanganan peserta didik dari Wali Kelas kepada Guru Bimbingan Konseling.
            </p>
          </div>

          {['ADMIN', 'WALI_KELAS', 'GURU_BK'].includes(user?.role) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              Buat Rujukan Murid
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Peserta Didik</th>
                  <th className="p-4">Wali Kelas</th>
                  <th className="p-4">Alasan Rujukan</th>
                  <th className="p-4">Prioritas</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data rujukan...</td></tr>
                ) : referrals.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada rujukan dari wali kelas.</td></tr>
                ) : (
                  referrals.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold text-slate-400">{r.date}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{r.studentName}</p>
                        <p className="text-[10px] text-slate-400">Kelas: {r.className}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{r.homeroomTeacherName}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{r.reason}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.priority === 'Mendesak' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{r.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Referral */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Ajukan Rujukan Peserta Didik ke Guru BK</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <StudentSelect
                  value={formData.studentId}
                  onChange={(id) => setFormData({ ...formData, studentId: id })}
                  label="Pilih Peserta Didik yang Dirujuk *"
                  placeholder="Cari nama murid, NIS, atau filter kelas..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Alasan Utama Rujukan *</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Contoh: Nilai akademik menurun & menyendiri..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Kondisi yang Diamati *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.observedCondition}
                  onChange={(e) => setFormData({ ...formData, observedCondition: e.target.value })}
                  placeholder="Deskripsi pengamatan kondisi di kelas..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Prioritas Rujukan</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Normal">Normal</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Mendesak">Mendesak</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl">Kirim Rujukan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
