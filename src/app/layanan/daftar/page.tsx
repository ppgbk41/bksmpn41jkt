'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { CalendarCheck, ShieldCheck, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import StudentSelect from '@/components/common/StudentSelect';

export default function DaftarKonselingPage() {
  const [user, setUser] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    nisn: '',
    bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.',
    issueCategory: 'Pribadi',
    reason: '',
    description: '',
    urgencyLevel: 'Tidak mendesak',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTime: '09:00 WIB',
    mode: 'Tatap Muka'
  });

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
        if (sData.user?.nipNis) {
          setFormData((prev) => ({ ...prev, nisn: sData.user.nipNis }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/konseling/pendaftaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengajukan pendaftaran');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan');
      setLoading(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-blue-800/40 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600/30 rounded-xl text-blue-400 border border-blue-500/30">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Formulir Pendaftaran Konseling Individu</h1>
              <p className="text-xs text-slate-300">Layanan Bimbingan dan Konseling SMP Negeri 41 Jakarta</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 bg-blue-950/60 p-3 rounded-2xl border border-blue-800/40">
            🔒 <strong>Kerahasiaan Terjamin:</strong> Informasi yang Anda sampaikan dalam formulir ini dijaga rahasia oleh Guru BK dan hanya digunakan untuk keperluan layanan konseling.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pendaftaran Konseling Berhasil Dikirimlkan!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Permohonan konseling Anda telah diterima oleh Guru BK. Anda akan menerima notifikasi status persetujuan jadwal konseling pada portal akun murid Anda.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
            >
              Buat Pendaftaran Baru
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl font-semibold text-center">
                {error}
              </div>
            )}

            <div>
              {user?.role === 'MURID' ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Pemohon Konseling (Akun Anda):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{user.name} (NIS/NISN: {user.nipNis || user.username})</span>
                </div>
              ) : (
                <StudentSelect
                  value={formData.studentId}
                  onChange={(id, student) => setFormData({ ...formData, studentId: id, nisn: student?.nisn || '' })}
                  label="Pilih Peserta Didik (Konseli) *"
                  placeholder="Ketik nama murid, NIS, atau filter kelas..."
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilihan Guru BK / Konselor</label>
                <select
                  value={formData.bkTeacherName}
                  onChange={(e) => setFormData({ ...formData, bkTeacherName: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                >
                  <option value="Dra. Hj. Siti Aminah, M.Pd.">Dra. Hj. Siti Aminah, M.Pd. (Koordinator BK)</option>
                  <option value="Bambang Ahmad, S.Psi.">Bambang Ahmad, S.Psi.</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Permasalahan *</label>
                <select
                  value={formData.issueCategory}
                  onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                >
                  <option value="Pribadi">Pribadi</option>
                  <option value="Belajar">Belajar</option>
                  <option value="Sosial">Sosial / Pertemanan</option>
                  <option value="Karier">Karier / Minat Studi</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Perundungan">Perundungan (Bullying)</option>
                  <option value="Kedisiplinan">Kedisiplinan / Kehadiran</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Ingin Konseling</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Alasan singkat..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gambaran Singkat Kondisi yang Dialami *</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ceritakan singkat kendala atau perasaan yang sedang dialami..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tingkat Kebutuhan Bantuan *</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'Tidak mendesak', label: '1. Tidak Mendesak', color: 'border-slate-300 text-slate-700' },
                  { value: 'Perlu dibicarakan dalam waktu dekat', label: '2. Waktu Dekat', color: 'border-amber-400 text-amber-600' },
                  { value: 'Mendesak dan membutuhkan bantuan segera', label: '3. MENDESAK (Segera)', color: 'border-red-500 text-red-600 font-bold' }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`p-3 border rounded-xl cursor-pointer flex items-center gap-2 ${
                      formData.urgencyLevel === opt.value
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-600 text-blue-600 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgencyLevel"
                      value={opt.value}
                      checked={formData.urgencyLevel === opt.value}
                      onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilihan Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilihan Waktu Jam</label>
                <input
                  type="text"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  placeholder="09:00 WIB"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mode Konseling</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                >
                  <option value="Tatap Muka">Tatap Muka di Ruang BK</option>
                  <option value="Daring">Daring (Online Meeting)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Mengirim...' : 'Kirim Pendaftaran Konseling'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
