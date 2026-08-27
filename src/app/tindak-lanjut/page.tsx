'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, Plus, CheckCircle2, UserCheck, X } from 'lucide-react';

export default function TindakLanjutPage() {
  const [user, setUser] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    type: 'Home Visit',
    scheduleDate: new Date().toISOString().split('T')[0],
    involvedParties: 'Guru BK & Wali Kelas',
    monitoringResult: '',
    conditionChange: ''
  });

  useEffect(() => {
    fetchSessionAndFollowUps();
  }, []);

  const fetchSessionAndFollowUps = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/konseling/tindak-lanjut');
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data.followUps || []);
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
      const res = await fetch('/api/konseling/tindak-lanjut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchSessionAndFollowUps();
      } else {
        alert('Gagal menambah tindak lanjut');
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pemantauan & Tindak Lanjut Konseling</h1>
            <p className="text-xs text-slate-500 mt-1">
              Tracking pelaksanaan Home Visit, Pertemuan Ortu, Konferensi Kasus, dan Rujukan Ahli.
            </p>
          </div>

          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              Agenda Tindak Lanjut Baru
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-4">Tanggal Agenda</th>
                  <th className="p-4">Peserta Didik</th>
                  <th className="p-4">Jenis Tindak Lanjut</th>
                  <th className="p-4">Pihak Terlibat</th>
                  <th className="p-4">Hasil Pemantauan</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat agenda tindak lanjut...</td></tr>
                ) : followUps.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada agenda tindak lanjut.</td></tr>
                ) : (
                  followUps.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{f.scheduleDate}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{f.student?.name}</p>
                        <p className="text-[10px] text-slate-400">Kelas: {f.student?.currentClass?.name}</p>
                      </td>
                      <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{f.type}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{f.involvedParties}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{f.monitoringResult || '-'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold rounded-full">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Follow Up */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tambah Agenda Tindak Lanjut</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jenis Tindak Lanjut *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Home Visit">Home Visit (Kunjungan Rumah)</option>
                  <option value="Pertemuan Orang Tua">Pertemuan Orang Tua / Wali</option>
                  <option value="Konsultasi Wali Kelas">Konsultasi Wali Kelas</option>
                  <option value="Konferensi Kasus">Konferensi Kasus</option>
                  <option value="Rujukan Ahli">Rujukan Ahli (Psikolog / Dokter)</option>
                  <option value="Pemantauan Berkala">Pemantauan Berkala</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Jadwal Tanggal *</label>
                <input
                  type="date"
                  required
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Pihak yang Terlibat *</label>
                <input
                  type="text"
                  required
                  value={formData.involvedParties}
                  onChange={(e) => setFormData({ ...formData, involvedParties: e.target.value })}
                  placeholder="Guru BK, Wali Kelas, Ortu..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl">Simpan Agenda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
