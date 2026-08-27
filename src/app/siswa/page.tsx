'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  Download,
  Upload,
  ArrowRightLeft,
  GraduationCap,
  CheckCircle2,
  Clock,
  X,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

function SiswaContent() {
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level');
  const actionParam = searchParams?.get('action');

  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>(levelParam || 'ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(actionParam === 'add');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [fileName, setFileName] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    className: '7A',
    birthPlace: 'Jakarta',
    birthDate: '2012-01-01',
    religion: 'Islam',
    address: '',
    phone: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentJob: ''
  });

  useEffect(() => {
    fetchSessionAndStudents();
  }, [selectedGrade, selectedClass, search, genderFilter]);

  const fetchSessionAndStudents = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      let url = `/api/siswa?search=${encodeURIComponent(search)}`;
      if (selectedGrade !== 'ALL') url += `&level=${selectedGrade}`;
      if (selectedClass !== 'ALL') url += `&className=${selectedClass}`;
      if (genderFilter !== 'ALL') url += `&gender=${genderFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
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
      const res = await fetch('/api/siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchSessionAndStudents();
        setFormData({
          nis: '', nisn: '', name: '', gender: 'L', className: '7A', birthPlace: 'Jakarta',
          birthDate: '2012-01-01', religion: 'Islam', address: '', phone: '', fatherName: '', motherName: '', parentPhone: '', parentJob: ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menambah siswa');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data peserta didik: ${name}?`)) return;
    try {
      const res = await fetch(`/api/siswa/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSessionAndStudents();
      } else {
        alert('Gagal menghapus data');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  const exportToExcel = () => {
    const exportData = students.map((s, idx) => ({
      'No': idx + 1,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Nama Lengkap': s.name,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kelas': s.currentClass,
      'Status Asesmen': s.assessmentStatus,
      'Jumlah Konseling': s.counselingCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Peserta Didik');
    XLSX.writeFile(workbook, `Data_Peserta_Didik_SMPN41_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Generate & Download Template Excel
  const downloadTemplate = () => {
    const templateData = [
      {
        'NIS': '26001',
        'NISN': '0091234567',
        'Nama Lengkap': 'Ahmad Fauzi Pratama',
        'Jenis Kelamin': 'L',
        'Kelas': '7A',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2013-05-12',
        'Agama': 'Islam',
        'Alamat': 'Jl. Harsono RM No. 41, Ragunan, Jakarta Selatan',
        'No Telepon': '081234567891',
        'Nama Ayah': 'Bambang Pratama',
        'Nama Ibu': 'Siti Rohmah',
        'No HP Orang Tua': '081298765432',
        'Pekerjaan Orang Tua': 'Wiraswasta'
      },
      {
        'NIS': '26002',
        'NISN': '0091234568',
        'Nama Lengkap': 'Anisa Putri Maharani',
        'Jenis Kelamin': 'P',
        'Kelas': '7A',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2013-08-20',
        'Agama': 'Islam',
        'Alamat': 'Jl. Kebagusan Raya No. 12, Pasar Minggu',
        'No Telepon': '081234567892',
        'Nama Ayah': 'Hendra Maharani',
        'Nama Ibu': 'Dewi Sartika',
        'No HP Orang Tua': '081298765433',
        'Pekerjaan Orang Tua': 'Karyawan Swasta'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, `Template_Impor_Siswa_SMPN41.xlsx`);
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
          alert('File Excel/CSV tidak memiliki baris data');
          return;
        }

        setImportPreview(jsonData);
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Gagal membaca file Excel/CSV. Pastikan format file benar.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Submit Import Data
  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;

    try {
      setImportLoading(true);
      const res = await fetch('/api/siswa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: importPreview })
      });
      const data = await res.json();
      if (res.ok) {
        setImportSummary(data.summary);
        fetchSessionAndStudents();
      } else {
        alert(data.error || 'Gagal mengimpor data');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat mengimpor data');
    } finally {
      setImportLoading(false);
    }
  };

  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Data Peserta Didik</h1>
            <p className="text-xs text-slate-500 mt-1">
              Pengelolaan terpusat peserta didik Kelas VII, VIII, dan IX SMP Negeri 41 Jakarta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['ADMIN', 'GURU_BK'].includes(user?.role) && (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Manual
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(true);
                    setImportPreview([]);
                    setImportSummary(null);
                    setFileName('');
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Impor Excel / CSV
                </button>
              </>
            )}
            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Ekspor Excel
            </button>
          </div>
        </div>

        {/* Tiered Class Selection Navigation */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          {/* Grade Tabs (VII, VIII, IX) */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Tingkat Kelas:</span>
            {[
              { id: 'ALL', label: 'Semua Tingkat' },
              { id: '7', label: 'Kelas VII' },
              { id: '8', label: 'Kelas VIII' },
              { id: '9', label: 'Kelas IX' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGrade(g.id);
                  setSelectedClass('ALL');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedGrade === g.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Section Buttons (A - G) */}
          {selectedGrade !== 'ALL' && (
            <div className="flex items-center gap-2 pt-1 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Ruang Kelas:</span>
              <button
                onClick={() => setSelectedClass('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                  selectedClass === 'ALL'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-400'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
                }`}
              >
                Semua {selectedGrade}
              </button>
              {sections.map((sec) => {
                const targetClassName = `${selectedGrade}${sec}`;
                return (
                  <button
                    key={sec}
                    onClick={() => setSelectedClass(targetClassName)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      selectedClass === targetClassName
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Kelas {targetClassName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama Murid, NIS, atau NISN..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">Semua Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Students Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 w-12 text-center">No</th>
                  <th className="p-4">NIS / NISN</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">L/P</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Riwayat Kelas</th>
                  <th className="p-4">Status Asesmen</th>
                  <th className="p-4 text-center">Sesi Konseling</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Memuat data peserta didik...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Tidak ada data peserta didik yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{s.nis}</p>
                        <p className="text-[10px] text-slate-400">NISN: {s.nisn}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                        {s.gender === 'L' ? 'L' : 'P'}
                      </td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                        {s.currentClass}
                      </td>
                      <td className="p-4">
                        {s.previousHistories && s.previousHistories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.previousHistories.map((h: any, hIdx: number) => (
                              <span key={hIdx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-medium">
                                {h.academicYear}: {h.className}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          s.assessmentStatus === 'Sudah Asesmen'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {s.assessmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {s.counselingCount}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/siswa/${s.id}`}
                            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors"
                            title="Lihat Profil Terintegrasi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                            <button
                              onClick={() => handleDelete(s.id, s.name)}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 hover:bg-red-200 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Import Excel / CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Impor Data Peserta Didik (Excel / CSV)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!importSummary ? (
              <div className="space-y-4 text-xs">
                {/* Download Template Banner */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Gunakan Template Resmi SMPN 41 Jakarta
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                      Format sudah disesuaikan dengan kolom NIS, NISN, Nama, Kelas, Biodata, & Ortu.
                    </p>
                  </div>
                  <button
                    onClick={downloadTemplate}
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
                    id="excelFileInput"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="excelFileInput" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {fileName ? fileName : 'Pilih File Excel (.xlsx / .xls) atau CSV'}
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
                        Pratinjau Data ({importPreview.length} Siswa Terdeteksi):
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        Siap Diimpor
                      </span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 sticky top-0">
                          <tr>
                            <th className="p-2">NIS</th>
                            <th className="p-2">NISN</th>
                            <th className="p-2">Nama</th>
                            <th className="p-2">L/P</th>
                            <th className="p-2">Kelas</th>
                            <th className="p-2">No HP Ortu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {importPreview.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-2 font-bold">{row.NIS || row.nis || '-'}</td>
                              <td className="p-2">{row.NISN || row.nisn || '-'}</td>
                              <td className="p-2 font-semibold">{row['Nama Lengkap'] || row.Nama || row.name || '-'}</td>
                              <td className="p-2">{row['Jenis Kelamin'] || row.JK || row.gender || '-'}</td>
                              <td className="p-2 text-blue-600 font-bold">{row.Kelas || row.kelas || row.className || '-'}</td>
                              <td className="p-2">{row['No HP Orang Tua'] || row.parentPhone || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importPreview.length > 5 && (
                      <p className="text-[10px] text-slate-400 italic text-center">
                        + Menampilkan 5 dari total {importPreview.length} data siswa
                      </p>
                    )}
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
                        Mengimpor Data...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Impor {importPreview.length} Data Siswa
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
                  Impor Data Siswa Berhasil Diselesaikan!
                </h4>
                
                <div className="grid grid-cols-3 gap-3 text-left max-w-md mx-auto">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Dibuat Baru</p>
                    <p className="text-base font-bold text-emerald-600">{importSummary.createdCount} Siswa</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40">
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold">Diperbarui</p>
                    <p className="text-base font-bold text-blue-600">{importSummary.updatedCount} Siswa</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold">Gagal / Dilewati</p>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">{importSummary.errorCount} Baris</p>
                  </div>
                </div>

                <p className="text-slate-500 text-xs">
                  Akun login siswa (Password default: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">murid123</code>) telah otomatis dibuat.
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

      {/* Modal Add Student Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tambah Peserta Didik Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    placeholder="24706"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    placeholder="0089998877"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Siswa..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value.toUpperCase() })}
                    placeholder="7A"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-blue-600 font-semibold"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default function SiswaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat Halaman Data Peserta Didik...</div>}>
      <SiswaContent />
    </Suspense>
  );
}
