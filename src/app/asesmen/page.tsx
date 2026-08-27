'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ClipboardCheck, Plus, Search, Printer, CheckCircle2, X } from 'lucide-react';
import StudentSelect from '@/components/common/StudentSelect';

export default function AsesmenPage() {
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Assessment Form
  const [formData, setFormData] = useState({
    studentId: '',
    assessmentName: 'Angket Kebutuhan Peserta Didik (AKPD)',
    date: new Date().toISOString().split('T')[0],
    score: '80',
    category: 'Sedang',
    interpretation: '',
    attentionAreas: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchSessionAndAssessments();
  }, []);

  const fetchSessionAndAssessments = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/asesmen');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.results || []);
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
      const res = await fetch('/api/asesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchSessionAndAssessments();
      } else {
        alert('Gagal menyimpan hasil asesmen');
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Hasil Asesmen Peserta Didik</h1>
            <p className="text-xs text-slate-500 mt-1">
              Data instrumen asesmen AKPD, minat bakat, gaya belajar, sosio-emosional, dan karier murid.
            </p>
          </div>
          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <Plus className="w-4 h-4" />
              Input Asesmen Baru
            </button>
          )}
        </div>

        {/* Assessment Results Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Peserta Didik</th>
                  <th className="p-4">Nama Asesmen</th>
                  <th className="p-4">Skor / Kategori</th>
                  <th className="p-4">Interpretasi Hasil</th>
                  <th className="p-4">Rekomendasi Layanan BK</th>
                  <th className="p-4">Konselor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Memuat data asesmen...</td></tr>
                ) : assessments.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada data asesmen.</td></tr>
                ) : (
                  assessments.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-semibold text-slate-400">{a.date}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{a.student?.name}</p>
                        <p className="text-[10px] text-slate-400">{a.student?.currentClass?.name} • NISN: {a.student?.nisn}</p>
                      </td>
                      <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{a.assessmentName}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold rounded-lg">
                          {a.category} {a.score ? `(${a.score})` : ''}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs">{a.interpretation}</td>
                      <td className="p-4 text-emerald-600 font-medium max-w-xs">{a.recommendations}</td>
                      <td className="p-4 text-slate-500">{a.bkTeacherName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Assessment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Input Hasil Asesmen Peserta Didik</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <StudentSelect
                  value={formData.studentId}
                  onChange={(id) => setFormData({ ...formData, studentId: id })}
                  label="Pilih Peserta Didik yang Diasesmen *"
                  placeholder="Ketik nama siswa, NIS, atau filter kelas..."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Asesmen *</label>
                <select
                  value={formData.assessmentName}
                  onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                >
                  <option value="Angket Kebutuhan Peserta Didik (AKPD)">Angket Kebutuhan Peserta Didik (AKPD)</option>
                  <option value="Asesmen Minat & Bakat">Asesmen Minat & Bakat</option>
                  <option value="Asesmen Gaya Belajar">Asesmen Gaya Belajar</option>
                  <option value="Asesmen Hubungan Sosio-Emosional">Asesmen Hubungan Sosio-Emosional</option>
                  <option value="Asesmen Kondisi Pribadi">Asesmen Kondisi Pribadi</option>
                  <option value="Asesmen Kesiapan Karier">Asesmen Kesiapan Karier</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skor Asesmen</label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Hasil</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                    <option value="Visual">Visual</option>
                    <option value="Auditori">Auditori</option>
                    <option value="Kinestetik">Kinestetik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interpretasi Hasil</label>
                <textarea
                  rows={2}
                  value={formData.interpretation}
                  onChange={(e) => setFormData({ ...formData, interpretation: e.target.value })}
                  placeholder="Uraian interpretasi hasil asesmen..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rekomendasi Layanan BK</label>
                <textarea
                  rows={2}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                  placeholder="Rekomendasi tindakan layanan konseling..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold">Simpan Hasil</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
