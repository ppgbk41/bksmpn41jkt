'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  CheckCircle2,
  UserCog,
  X,
  RefreshCw,
  School,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function PengaturanKelasPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    level: 7,
    section: 'A',
    name: '7A',
    assignedUserId: ''
  });

  useEffect(() => {
    fetchClasses();
  }, [activeTab]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      let url = '/api/kelas';
      if (activeTab !== 'ALL') {
        url += `?level=${activeTab}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
        setTeachers(data.teachers || []);
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
      const className = `${formData.level}${formData.section.toUpperCase()}`;
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className,
          level: formData.level,
          section: formData.section.toUpperCase(),
          assignedUserId: formData.assignedUserId || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        fetchClasses();
        alert(`Kelas ${className} berhasil ditambahkan!`);
      } else {
        alert(data.error || 'Gagal menambahkan kelas');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const res = await fetch('/api/kelas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClass.id,
          name: selectedClass.name,
          level: selectedClass.level,
          section: selectedClass.section,
          assignedUserId: selectedClass.assignedUserId || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        fetchClasses();
        alert(`Pengaturan kelas ${selectedClass.name} berhasil diperbarui!`);
      } else {
        alert(data.error || 'Gagal memperbarui kelas');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas ${name}?`)) return;
    try {
      const res = await fetch(`/api/kelas?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchClasses();
        alert(`Kelas ${name} berhasil dihapus.`);
      } else {
        alert(data.error || 'Gagal menghapus kelas');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const exportClassesToExcel = () => {
    const exportData = classes.map((c, idx) => ({
      'No': idx + 1,
      'Nama Kelas': c.name,
      'Tingkat': `Kelas ${c.level}`,
      'Ruang/Gugus': c.section,
      'Wali Kelas': c.teacherName,
      'NIP Wali Kelas': c.teacherNip,
      'Jumlah Siswa': c.totalStudents,
      'Laki-laki': c.maleCount,
      'Perempuan': c.femaleCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Kelas');
    XLSX.writeFile(workbook, `Daftar_Kelas_SMPN41_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalStudentsAll = classes.reduce((acc, c) => acc + c.totalStudents, 0);
  const totalWithTeacher = classes.filter((c) => c.teacherName && c.teacherName !== 'Belum Ditentukan').length;

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <School className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Pengaturan & Manajemen Kelas
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pusat konfigurasi terpadu rombongan belajar Kelas VII, VIII, IX, dan penetapan Wali Kelas SMP Negeri 41 Jakarta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ADMIN', 'GURU_BK'].includes(user?.role) && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Kelas Baru
              </button>
            )}
            <button
              onClick={exportClassesToExcel}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Ekspor Excel
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Total Rombel</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {classes.length} Kelas
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Total Siswa Aktif</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {totalStudentsAll} Siswa
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Wali Kelas Terisi</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {totalWithTeacher} / {classes.length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Rata-rata Siswa</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {classes.length > 0 ? Math.round(totalStudentsAll / classes.length) : 0} / Kelas
              </p>
            </div>
          </div>
        </div>

        {/* Filter, Tabs, and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            {/* Grade Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'Semua Tingkat' },
                { id: '7', label: 'Kelas VII' },
                { id: '8', label: 'Kelas VIII' },
                { id: '9', label: 'Kelas IX' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Kartu (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tampilan Tabel (List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama Kelas (misal 7A) atau Nama Wali..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400">
            Memuat data kelas...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400">
            Tidak ada rombongan belajar yang sesuai dengan kriteria pencarian.
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                        {c.name}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          Kelas {c.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Tingkat {c.level} • Ruang {c.section}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 font-bold text-[11px] rounded-xl">
                      {c.totalStudents} Siswa
                    </span>
                  </div>

                  {/* Homeroom Teacher Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Wali Kelas:</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {c.teacherName}
                    </p>
                    {c.teacherNip && c.teacherNip !== '-' && (
                      <p className="text-[10px] text-slate-400">NIP: {c.teacherNip}</p>
                    )}
                  </div>

                  {/* Gender breakdown badges */}
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md">
                      👦 {c.maleCount} Laki-laki
                    </span>
                    <span className="px-2 py-0.5 bg-pink-100/60 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded-md">
                      👧 {c.femaleCount} Perempuan
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/siswa?className=${c.name}`}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Siswa ({c.totalStudents})
                  </Link>

                  {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                    <button
                      onClick={() => {
                        setSelectedClass(c);
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
                      title="Atur Wali Kelas / Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {user?.role === 'ADMIN' && c.totalStudents === 0 && (
                    <button
                      onClick={() => handleDeleteClass(c.id, c.name)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold transition-all"
                      title="Hapus Kelas Kosong"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">Tingkat & Ruang</th>
                    <th className="p-4">Wali Kelas</th>
                    <th className="p-4">Siswa Aktif</th>
                    <th className="p-4">Komposisi (L / P)</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredClasses.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100 text-sm">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-lg">
                          {c.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Kelas {c.level} (Ruang {c.section})
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{c.teacherName}</p>
                          {c.teacherNip && c.teacherNip !== '-' && (
                            <p className="text-[10px] text-slate-400">NIP: {c.teacherNip}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {c.totalStudents} Siswa
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] font-medium text-slate-500">
                          {c.maleCount} L / {c.femaleCount} P
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/siswa?className=${c.name}`}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                            title="Buka Data Siswa"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                            <button
                              onClick={() => {
                                setSelectedClass(c);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                              title="Edit & Atur Wali Kelas"
                            >
                              <Edit className="w-3.5 h-3.5" />
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

        {/* Modal 1: Tambah Kelas Baru */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Tambah Rombongan Belajar / Kelas Baru
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Tingkat Jenjang *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value={7}>Kelas VII (7)</option>
                      <option value={8}>Kelas VIII (8)</option>
                      <option value={9}>Kelas IX (9)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Ruang / Gugus *</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      placeholder="A, B, C, D..."
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 uppercase"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-700 dark:text-blue-300 font-bold">
                  Nama Kelas yang akan dibuat: <span className="text-sm underline">{formData.level}{formData.section}</span>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tetapkan Wali Kelas (Opsional)</label>
                  <select
                    value={formData.assignedUserId}
                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="">-- Pilih Guru / Wali Kelas --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
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
                    Simpan Kelas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Kelas & Penetapan Wali Kelas */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Edit Pengaturan Kelas {selectedClass.name}
                </h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Nama Rombel / Kelas</label>
                  <input
                    type="text"
                    required
                    value={selectedClass.name}
                    onChange={(e) => setSelectedClass({ ...selectedClass, name: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Pilih Wali Kelas yang Bertugas</label>
                  <select
                    value={selectedClass.assignedUserId || ''}
                    onChange={(e) => setSelectedClass({ ...selectedClass, assignedUserId: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-semibold"
                  >
                    <option value="">-- Belum Ditentukan / Kosongkan --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Guru yang dipilih akan otomatis mendapatkan hak akses wali kelas untuk murid di kelas ini.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-500"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
