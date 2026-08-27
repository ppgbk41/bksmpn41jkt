'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  UserCog,
  Plus,
  ShieldCheck,
  Key,
  Trash2,
  X,
  Upload,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ManajemenPenggunaPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStudentGenModal, setShowStudentGenModal] = useState(false);

  // Student Account Generator State
  const [studentGenLoading, setStudentGenLoading] = useState(false);
  const [studentGenResults, setStudentGenResults] = useState<any[]>([]);
  const [studentGenTarget, setStudentGenTarget] = useState('ALL');

  // Import State
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [fileName, setFileName] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    role: 'GURU_BK',
    nipNis: '',
    phone: '',
    password: ''
  });

  const handleGenerateStudentAccounts = async () => {
    try {
      setStudentGenLoading(true);
      const res = await fetch('/api/users/generate-student-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: studentGenTarget === 'ALL' ? undefined : studentGenTarget
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStudentGenResults(data.accounts || []);
        fetchUsers();
        alert(data.message || 'Akun murid berhasil di-generate!');
      } else {
        alert(data.error || 'Gagal men-generate akun murid');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setStudentGenLoading(false);
    }
  };

  const downloadStudentCredentialsExcel = () => {
    if (studentGenResults.length === 0) return;

    const dataToExport = studentGenResults.map((s, idx) => ({
      'No': idx + 1,
      'Nama Siswa': s.namaSiswa,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Kelas': s.kelas,
      'Username (Login)': s.username,
      'Password (Login)': s.password,
      'Format': 'Kombinasi Huruf bk + 3 Angka Acak'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Akun Login Siswa');
    XLSX.writeFile(workbook, `Daftar_Akun_Login_Siswa_SMPN41_BK.xlsx`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchUsers();
        setFormData({
          username: '',
          email: '',
          name: '',
          role: 'GURU_BK',
          nipNis: '',
          phone: '',
          password: ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menambah pengguna');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  const handleDeleteUser = async (targetId: string, name: string, username: string) => {
    if (targetId === user?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan untuk masuk.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${name}" (${username})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${targetId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Akun pengguna "${name}" berhasil dihapus.`);
        fetchUsers();
      } else {
        alert(data.error || 'Gagal menghapus pengguna');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat menghapus pengguna');
    }
  };

  // Download Template Guru & Wali Kelas
  const downloadTeacherTemplate = () => {
    const templateData = [
      {
        'NIP': '198504122010011005',
        'Nama Lengkap': 'Dra. Hj. Siti Aminah, M.Pd.',
        'Role': 'GURU_BK',
        'Wali Kelas': '',
        'Email': 'siti.aminah@smp41jkt.sch.id',
        'No HP': '081398765432',
        'Username': 'gurubk_siti',
        'Password': 'bk123'
      },
      {
        'NIP': '198203152008012003',
        'Nama Lengkap': 'Wali Kelas 7A, S.Pd.',
        'Role': 'WALI_KELAS',
        'Wali Kelas': '7A',
        'Email': 'wali7a@smp41jkt.sch.id',
        'No HP': '081287654321',
        'Username': 'wali_7a',
        'Password': 'wali123'
      },
      {
        'NIP': '198305202009012004',
        'Nama Lengkap': 'Wali Kelas 8A, S.Pd.',
        'Role': 'WALI_KELAS',
        'Wali Kelas': '8A',
        'Email': 'wali8a@smp41jkt.sch.id',
        'No HP': '081287654322',
        'Username': 'wali_8a',
        'Password': 'wali123'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Guru & Wali');
    XLSX.writeFile(workbook, `Template_Impor_Guru_Wali_SMPN41.xlsx`);
  };

  // Handle File Upload & Parse
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('File Excel tidak memiliki baris data');
          return;
        }

        setImportPreview(jsonData);
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Gagal membaca file Excel. Pastikan format file benar.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit Import Data
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;

    try {
      setImportLoading(true);
      const res = await fetch('/api/users/import-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers: importPreview })
      });
      const data = await res.json();
      if (res.ok) {
        setImportSummary(data.summary);
        fetchUsers();
      } else {
        alert(data.error || 'Gagal mengimpor data guru');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat mengimpor data guru');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Manajemen Pengguna & Guru</h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengelolaan akun Guru BK, Wali Kelas, Administrator, dan Tenaga Pendidik SMP Negeri 41 Jakarta.
            </p>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Manual
              </button>
              <button
                onClick={() => {
                  setShowStudentGenModal(true);
                  setStudentGenResults([]);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
              >
                <Key className="w-4 h-4" />
                Generate Akun Murid (bk+3 Angka)
              </button>
              <button
                onClick={() => {
                  setShowImportModal(true);
                  setImportPreview([]);
                  setImportSummary(null);
                  setFileName('');
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                Impor Guru & Wali (Excel)
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Username</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Email / NIP</th>
                  <th className="p-4">Role Hak Akses</th>
                  <th className="p-4">Status Sandi</th>
                  <th className="p-4 text-center">Aksi Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Memuat data pengguna...</td></tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                        {u.username}
                        {u.id === user?.id && (
                          <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                            Anda (Aktif)
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                      <td className="p-4 text-slate-500">{u.email || u.nipNis || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          u.role === 'GURU_BK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          u.role === 'WALI_KELAS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.mustChangePassword ? (
                          <span className="text-amber-500 font-semibold">Sandi Sementara</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">Aktif (Tersandi)</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.id === user?.id ? (
                          <span className="text-[10px] text-slate-400 italic">Akun Utama</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name, u.username)}
                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800 transition-colors inline-flex items-center gap-1 font-semibold"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Import Guru & Wali Kelas Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Impor Data Guru & Wali Kelas (Excel)
                </h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!importSummary ? (
              <div className="space-y-4 text-xs">
                {/* Download Template Banner */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Format Template Guru & Wali Kelas
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                      Termasuk kolom NIP, Nama, Role (GURU_BK / WALI_KELAS), Kelas yang diampu, & Akun.
                    </p>
                  </div>
                  <button
                    onClick={downloadTeacherTemplate}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 transition-all"
                  >
                    <FileDown className="w-4 h-4" />
                    Unduh Template Excel
                  </button>
                </div>

                {/* File Upload Zone */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    id="teacherExcelFileInput"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="teacherExcelFileInput" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {fileName ? fileName : 'Pilih File Excel Guru & Wali (.xlsx / .xls)'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Klik untuk memilih file dari komputer Anda
                    </p>
                  </label>
                </div>

                {/* Preview Table */}
                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        Pratinjau Data Guru ({importPreview.length} Baris):
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Siap Diimpor
                      </span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2">NIP</th>
                            <th className="p-2">Nama Guru</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Wali Kelas</th>
                            <th className="p-2">Username</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {importPreview.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2 font-bold">{row.NIP || row.nip || '-'}</td>
                              <td className="p-2 font-semibold">{row['Nama Lengkap'] || row.Nama || row.name || '-'}</td>
                              <td className="p-2 text-blue-600 font-bold">{row.Role || row.role || 'WALI_KELAS'}</td>
                              <td className="p-2 text-emerald-600 font-bold">{row['Wali Kelas'] || row.className || '-'}</td>
                              <td className="p-2">{row.Username || row.username || '(Otomatis)'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    disabled={importLoading}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={importLoading || importPreview.length === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    {importLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengimpor Data Guru...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Impor {importPreview.length} Data Guru
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Success Result Screen */
              <div className="space-y-4 text-xs text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Impor Data Guru & Wali Kelas Berhasil!
                </h4>
                
                <div className="grid grid-cols-3 gap-3 text-left max-w-md mx-auto">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Dibuat Baru</p>
                    <p className="text-base font-bold text-emerald-600">{importSummary.createdCount} Guru</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40">
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">Diperbarui</p>
                    <p className="text-base font-bold text-blue-600">{importSummary.updatedCount} Guru</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold">Gagal</p>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">{importSummary.errorCount} Baris</p>
                  </div>
                </div>

                <p className="text-slate-500 text-xs">
                  Akun dan penetapan wali kelas di sistem telah otomatis terhubung.
                </p>

                <div className="pt-4 border-t flex justify-center">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportSummary(null);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-500"
                  >
                    Tutup & Lihat Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Add User Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tambah Akun Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="gurubk_rudi"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rudi Hermawan, S.Psi."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Hak Akses *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="GURU_BK">Guru BK</option>
                  <option value="WALI_KELAS">Wali Kelas</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="MURID">Peserta Didik</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl">Buat Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generate Akun Siswa (Format bk + 3 Angka Acak) */}
      {showStudentGenModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Generator Akun Login Siswa (Format bk + 3 Angka Acak)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Buat akun login siswa unik otomatis dengan kombinasi huruf <strong>bk</strong> dan <strong>3 digit angka acak</strong> (Contoh: bk384, bk719).
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStudentGenModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentGenResults.length === 0 ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-2xl space-y-2">
                  <span className="font-bold text-purple-900 dark:text-purple-300 block">Aturan Pembuatan Akun:</span>
                  <ul className="list-disc pl-4 space-y-1 text-purple-800 dark:text-purple-300/90 text-[11px]">
                    <li><strong>Username</strong>: Kombinasi huruf <code className="bg-purple-200 dark:bg-purple-900 px-1 rounded">bk</code> + 3 digit angka unik acak (Contoh: <code className="font-bold">bk582</code>). Siswa juga tetap dapat login menggunakan NIS/NISN mereka.</li>
                    <li><strong>Password</strong>: Kombinasi huruf <code className="bg-purple-200 dark:bg-purple-900 px-1 rounded">bk</code> + 3 digit angka acak (Contoh: <code className="font-bold">bk147</code>).</li>
                    <li>Setelah digenerate, daftar seluruh username & password dapat langsung diunduh dalam format <strong>Excel / Kartu Akun</strong> untuk dibagikan kepada siswa.</li>
                  </ul>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Peserta Didik:
                  </label>
                  <select
                    value={studentGenTarget}
                    onChange={(e) => setStudentGenTarget(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-xs"
                  >
                    <option value="ALL">Semua Peserta Didik Aktif (Kelas 7, 8, dan 9)</option>
                    <option value="7">Khusus Jenjang Kelas 7 (7A - 7G)</option>
                    <option value="8">Khusus Jenjang Kelas 8 (8A - 8G)</option>
                    <option value="9">Khusus Jenjang Kelas 9 (9A - 9G)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowStudentGenModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={studentGenLoading}
                    onClick={handleGenerateStudentAccounts}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>{studentGenLoading ? 'Sedang Memproses Akun...' : 'Generate Akun Siswa Sekarang'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Berhasil Membuat {studentGenResults.length} Akun Login Murid</span>
                  </div>
                  <button
                    onClick={downloadStudentCredentialsExcel}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-transform active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Unduh Kartu Akun (Excel)</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 uppercase font-bold sticky top-0 border-b">
                      <tr>
                        <th className="p-3">Nama Siswa</th>
                        <th className="p-3">NIS</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Username (Login)</th>
                        <th className="p-3">Password (Login)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentGenResults.map((acc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{acc.namaSiswa}</td>
                          <td className="p-3 text-slate-500">{acc.nis}</td>
                          <td className="p-3 font-semibold">{acc.kelas}</td>
                          <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20">{acc.username}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">{acc.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-between items-center border-t">
                  <button
                    type="button"
                    onClick={() => setStudentGenResults([])}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Generate Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentGenModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-md"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
