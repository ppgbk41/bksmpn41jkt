'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Calendar,
  GraduationCap,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Check,
  History,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';

export default function TahunAjaranPage() {
  const [user, setUser] = useState<any>(null);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [activeYear, setActiveYear] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'promotion'>('manage');

  // Modal Tambah Tahun Ajaran
  const [showAddModal, setShowAddModal] = useState(false);
  const [newYearForm, setNewYearForm] = useState({
    year: '2026/2027',
    semester: 'Ganjil',
    setAsCurrent: true
  });

  // Modal Konfirmasi Kenaikan Kelas
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteSummary, setPromoteSummary] = useState<any>(null);
  const [promotionConfig, setPromotionConfig] = useState({
    sourceYear: '',
    targetYear: '2026/2027',
    semester: 'Ganjil',
    graduateGrade9: true,
    promoteGrade8: true,
    promoteGrade7: true,
    activateTargetYear: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/academic-years');
      if (res.ok) {
        const data = await res.json();
        setAcademicYears(data.academicYears || []);
        setActiveYear(data.activeYear || null);
        setStats(data.stats || null);

        if (data.activeYear) {
          const [startY, endY] = data.activeYear.year.split('/').map((y: string) => parseInt(y));
          const nextTarget = startY && endY ? `${startY + 1}/${endY + 1}` : '2026/2027';
          setPromotionConfig((prev) => ({
            ...prev,
            sourceYear: data.activeYear.year,
            targetYear: nextTarget
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newYearForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        fetchData();
        alert('Tahun ajaran baru berhasil ditambahkan!');
      } else {
        alert(data.error || 'Gagal menambahkan tahun ajaran');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleSetActive = async (id: string, year: string) => {
    if (!confirm(`Aktifkan Tahun Ajaran ${year} sebagai tahun ajaran berjalan?`)) return;
    try {
      const res = await fetch('/api/academic-years', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchData();
        alert(`Tahun ajaran ${year} sekarang aktif!`);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal mengubah tahun ajaran');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteYear = async (id: string, year: string) => {
    if (!confirm(`Hapus data Tahun Ajaran ${year}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/academic-years?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        alert(`Tahun ajaran ${year} berhasil dihapus.`);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleExecutePromotion = async () => {
    try {
      setPromoteLoading(true);
      const res = await fetch('/api/academic-years/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promotionConfig)
      });
      const data = await res.json();
      if (res.ok) {
        setPromoteSummary(data.summary);
        fetchData();
      } else {
        alert(data.error || 'Gagal memproses kenaikan kelas');
      }
    } catch (e) {
      alert('Terjadi kesalahan sistem saat memproses kenaikan kelas');
    } finally {
      setPromoteLoading(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Tahun Ajaran & Kenaikan Kelas
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengaturan tahun ajaran aktif, transisi kenaikan jenjang kelas VII-VIII-IX, dan kelulusan siswa SMPN 41 Jakarta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Tahun Ajaran
            </button>
            <button
              onClick={() => {
                setActiveTab('promotion');
                setShowPromoteModal(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              Kenaikan Kelas Massal
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Tahun Aktif</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeYear ? `${activeYear.year} (${activeYear.semester})` : '-'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Siswa Kelas 7</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats?.grade7Count ?? 0} Siswa
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Siswa Kelas 8</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats?.grade8Count ?? 0} Siswa
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Siswa Kelas 9</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats?.grade9Count ?? 0} Siswa
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Alumni Lulus</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {stats?.graduatedCount ?? 0} Siswa
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daftar Tahun Ajaran
          </button>
          <button
            onClick={() => setActiveTab('promotion')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'promotion'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Panduan Transisi & Kenaikan Jenjang
          </button>
        </div>

        {/* Tab 1: Daftar Tahun Ajaran */}
        {activeTab === 'manage' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Daftar Riwayat Tahun Ajaran
              </h2>
              <span className="text-xs text-slate-400">Total: {academicYears.length} Periode</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tahun Ajaran</th>
                    <th className="py-3.5 px-4">Semester</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Dibuat Pada</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {academicYears.map((ay) => (
                    <tr key={ay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {ay.year}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                          Semester {ay.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {ay.isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aktif Berjalan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Arsip Periode
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(ay.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!ay.isCurrent && (
                            <button
                              onClick={() => handleSetActive(ay.id, ay.year)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              title="Jadikan Tahun Ajaran Aktif"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Aktifkan
                            </button>
                          )}
                          {!ay.isCurrent && user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteYear(ay.id, ay.year)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Hapus Tahun Ajaran"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Alur Transisi & Kenaikan Jenjang */}
        {activeTab === 'promotion' && (
          <div className="space-y-6">
            {/* Visual Transition Architecture Flow */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Mekanisme Otomatis Transisi Tahun Ajaran Baru
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ketika tahun ajaran baru dimulai, sistem BK SMPN 41 secara cerdas dan terstruktur akan memindahkan siswa ke jenjang berikutnya:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 relative">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    Kelas IX ➔ Alumni (Lulus)
                  </h3>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1">
                    Semua siswa Kelas 9 (9A-9G) diubah statusnya menjadi <b>Lulus</b>. Riwayat rekam jejak konseling & asesmen tetap tersimpan aman sebagai arsip alumni.
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/60 px-2 py-1 rounded">
                    {stats?.grade9Count ?? 0} Siswa akan Diluluskan
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 relative">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    Kelas VIII ➔ Naik Kelas IX
                  </h3>
                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-1">
                    Siswa Kelas 8 (8A-8G) dinaikkan ke jenjang Kelas 9 (9A-9G). Riwayat kelas 8 otomatis dicatat ke riwayat kelas siswa.
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-1 rounded">
                    {stats?.grade8Count ?? 0} Siswa Naik ke Kelas 9
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50 relative">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white font-bold text-xs flex items-center justify-center mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-xs text-cyan-900 dark:text-cyan-200">
                    Kelas VII ➔ Naik Kelas VIII
                  </h3>
                  <p className="text-[11px] text-cyan-800/80 dark:text-cyan-300/80 mt-1">
                    Siswa Kelas 7 (7A-7G) dinaikkan ke jenjang Kelas 8 (8A-8G). Riwayat kelas 7 otomatis dicatat ke rekam jejak.
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-cyan-600 bg-cyan-100 dark:bg-cyan-900/60 px-2 py-1 rounded">
                    {stats?.grade7Count ?? 0} Siswa Naik ke Kelas 8
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mb-3">
                    4
                  </div>
                  <h3 className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                    Impor Siswa Baru Kelas VII
                  </h3>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                    Setelah transisi selesai, kelas 7 akan kosong dan Anda siap mengimpor data peserta didik baru angkatan baru via <b>Impor Excel</b>.
                  </p>
                  <div className="mt-3 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-1 rounded">
                    Siap Menggunakan Excel Import
                  </div>
                </div>
              </div>

              {/* Action Button to launch wizard */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowPromoteModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  Mulai Proses Kenaikan & Transisi Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Tambah Tahun Ajaran Baru */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Tambah Tahun Ajaran Baru
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026/2027"
                    value={newYearForm.year}
                    onChange={(e) => setNewYearForm({ ...newYearForm, year: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Format: YYYY/YYYY (Contoh: 2026/2027)</p>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Semester Awal</label>
                  <select
                    value={newYearForm.semester}
                    onChange={(e) => setNewYearForm({ ...newYearForm, semester: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="setAsCurrent"
                    checked={newYearForm.setAsCurrent}
                    onChange={(e) => setNewYearForm({ ...newYearForm, setAsCurrent: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <label htmlFor="setAsCurrent" className="font-medium cursor-pointer">
                    Jadikan langsung sebagai tahun ajaran aktif berjalan
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-500"
                  >
                    Simpan Periode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Wizard Kenaikan Kelas & Transisi Massal */}
        {showPromoteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Konfirmasi Kenaikan & Transisi Tahun Ajaran
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setPromoteSummary(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {!promoteSummary ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-blue-800 dark:text-blue-300">
                      Tindakan ini akan mengarsipkan riwayat kelas saat ini, meluluskan siswa kelas IX, dan memindahkan siswa kelas VII & VIII ke tingkat berikutnya.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">Tahun Ajaran Asal (Saat Ini)</label>
                      <input
                        type="text"
                        disabled
                        value={promotionConfig.sourceYear}
                        className="w-full px-3 py-2 border rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">Tahun Ajaran Baru (Tujuan)</label>
                      <input
                        type="text"
                        value={promotionConfig.targetYear}
                        onChange={(e) => setPromotionConfig({ ...promotionConfig, targetYear: e.target.value })}
                        placeholder="2026/2027"
                        className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold text-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <p className="font-bold text-slate-700 dark:text-slate-300">Konfirmasi Tindakan Massal:</p>
                    
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotionConfig.graduateGrade9}
                        onChange={(e) => setPromotionConfig({ ...promotionConfig, graduateGrade9: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Luluskan Siswa Kelas IX ({stats?.grade9Count ?? 0} Siswa)
                        </p>
                        <p className="text-[10px] text-slate-400">Status siswa diubah menjadi Alumni (Lulus).</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotionConfig.promoteGrade8}
                        onChange={(e) => setPromotionConfig({ ...promotionConfig, promoteGrade8: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Naikkan Siswa Kelas VIII ke Kelas IX ({stats?.grade8Count ?? 0} Siswa)
                        </p>
                        <p className="text-[10px] text-slate-400">8A ➔ 9A, 8B ➔ 9B, dst.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotionConfig.promoteGrade7}
                        onChange={(e) => setPromotionConfig({ ...promotionConfig, promoteGrade7: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          Naikkan Siswa Kelas VII ke Kelas VIII ({stats?.grade7Count ?? 0} Siswa)
                        </p>
                        <p className="text-[10px] text-slate-400">7A ➔ 8A, 7B ➔ 8B, dst.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotionConfig.activateTargetYear}
                        onChange={(e) => setPromotionConfig({ ...promotionConfig, activateTargetYear: e.target.checked })}
                        className="rounded text-emerald-600 w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-200">
                          Aktifkan {promotionConfig.targetYear} sebagai Tahun Ajaran Berjalan
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowPromoteModal(false)}
                      disabled={promoteLoading}
                      className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePromotion}
                      disabled={promoteLoading}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
                    >
                      {promoteLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Memproses Transisi...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-4 h-4" />
                          Eksekusi Kenaikan Kelas Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Success summary screen */
                <div className="space-y-4 text-xs text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Transisi Tahun Ajaran Berhasil Diproses!
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-left max-w-md mx-auto">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-400">Kelas IX Lulus</p>
                      <p className="text-sm font-bold text-emerald-600">{promoteSummary.graduatedCount} Siswa</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-400">Naik ke Kelas IX</p>
                      <p className="text-sm font-bold text-indigo-600">{promoteSummary.promotedGrade8Count} Siswa</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-[10px] text-slate-400">Naik ke Kelas VIII</p>
                      <p className="text-sm font-bold text-cyan-600">{promoteSummary.promotedGrade7Count} Siswa</p>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs">
                    Kelas VII sekarang siap untuk diisi dengan data peserta didik baru via <b>Impor Data Siswa</b>.
                  </p>

                  <div className="pt-4 border-t flex justify-center">
                    <button
                      onClick={() => {
                        setShowPromoteModal(false);
                        setPromoteSummary(null);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-500"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
