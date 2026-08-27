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

  const [selectedAssessmentDetail, setSelectedAssessmentDetail] = useState<any>(null);

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
                  <th className="p-4">Interpretasi & Detail Butir</th>
                  <th className="p-4">Rekomendasi Layanan BK</th>
                  <th className="p-4">Konselor</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">Memuat data asesmen...</td></tr>
                ) : assessments.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-slate-400">Belum ada data asesmen.</td></tr>
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
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold rounded-lg inline-block">
                          {a.category} {a.score ? `(${a.score})` : ''}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 max-w-xs space-y-2">
                        <p className="line-clamp-3">{a.interpretation}</p>
                        {a.attentionAreas && (
                          <button
                            onClick={() => setSelectedAssessmentDetail(a)}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Lihat Detail Butir Terpilih ({a.attentionAreas.split('\n').filter(Boolean).length})</span>
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-emerald-600 font-medium max-w-xs">{a.recommendations}</td>
                      <td className="p-4 text-slate-500">{a.bkTeacherName}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedAssessmentDetail(a)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300"
                          title="Lihat Detail Lengkap Asesmen"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </td>
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

      {/* Modal Detail Asesmen & Butir Terpilih */}
      {selectedAssessmentDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {selectedAssessmentDetail.assessmentName}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  Detail Asesmen: {selectedAssessmentDetail.student?.name} ({selectedAssessmentDetail.student?.currentClass?.name})
                </h3>
                <p className="text-[11px] text-slate-400">
                  NISN: {selectedAssessmentDetail.student?.nisn} • Tanggal: {selectedAssessmentDetail.date} • Konselor: {selectedAssessmentDetail.bkTeacherName}
                </p>
              </div>
              <button onClick={() => setSelectedAssessmentDetail(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-1">
                <span className="font-bold text-blue-900 dark:text-blue-300 block">Kategori & Skor:</span>
                <p className="text-blue-800 dark:text-blue-200 font-semibold">{selectedAssessmentDetail.category} {selectedAssessmentDetail.score ? `(Skor Total: ${selectedAssessmentDetail.score})` : ''}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Interpretasi Hasil:</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedAssessmentDetail.interpretation}</p>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Rekomendasi Layanan BK:</span>
                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">{selectedAssessmentDetail.recommendations}</p>
              </div>

              {/* Rincian Butir Terpilih */}
              {selectedAssessmentDetail.attentionAreas ? (
                <div className="space-y-2 border-t pt-3 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-blue-600" />
                      <span>Rincian Detail Butir yang Terpilih oleh Siswa ({selectedAssessmentDetail.attentionAreas.split('\n').filter(Boolean).length} Butir):</span>
                    </h4>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedAssessmentDetail.attentionAreas.split('\n').filter(Boolean).map((line: string, idx: number) => {
                      const match = line.match(/^(?:\d+\.\s*)?(?:\[(.*?)\]\s*)?(?:\((.*?)\)\s*)?(.*)$/);
                      const cat = match?.[1] || 'Umum';
                      const code = match?.[2] || '';
                      const text = match?.[3] || line;

                      let catColor = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
                      if (cat.toLowerCase().includes('pribadi')) catColor = 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-900';
                      if (cat.toLowerCase().includes('sosial')) catColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
                      if (cat.toLowerCase().includes('belajar')) catColor = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
                      if (cat.toLowerCase().includes('karier')) catColor = 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-900';

                      return (
                        <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
                          <span className="font-mono font-bold text-[10px] text-slate-400 shrink-0 mt-0.5">#{idx + 1}</span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${catColor}`}>
                                Bidang {cat}
                              </span>
                              {code && (
                                <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-mono">
                                  {code}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                              {text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-400 text-center">
                  Tidak ada rincian butir terpilih spesifik untuk asesmen ini.
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end border-t dark:border-slate-800">
              <button
                onClick={() => setSelectedAssessmentDetail(null)}
                className="px-5 py-2 bg-slate-800 text-white dark:bg-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
