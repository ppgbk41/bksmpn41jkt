'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart3, Download, Printer, Filter, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function LaporanPage() {
  const [user, setUser] = useState<any>(null);
  const [reportType, setReportType] = useState('REKAP_PELAYANAN');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('Ganjil');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/siswa');
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('LAPORAN PELAYANAN BIMBINGAN DAN KONSELING', 14, 15);
    doc.setFontSize(10);
    doc.text('SMP NEGERI 41 JAKARTA - TAHUN AJARAN 2025/2026', 14, 22);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 27);

    const tableRows = students.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.name,
      s.gender,
      s.currentClass,
      s.assessmentStatus,
      s.counselingCount
    ]);

    autoTable(doc, {
      startY: 32,
      head: [['No', 'NISN', 'Nama Peserta Didik', 'L/P', 'Kelas', 'Status Asesmen', 'Jumlah Sesi']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });

    doc.save(`Laporan_BK_SMPN41_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = () => {
    const exportData = students.map((s, idx) => ({
      'No': idx + 1,
      'NISN': s.nisn,
      'Nama Peserta Didik': s.name,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Kelas': s.currentClass,
      'Status Asesmen': s.assessmentStatus,
      'Jumlah Sesi Konseling': s.counselingCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan BK');
    XLSX.writeFile(workbook, `Laporan_BK_SMPN41_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Laporan & Rekapitulasi Pelayanan BK</h1>
            <p className="text-xs text-slate-500 mt-1">
              Generasi laporan terstruktur untuk pengawasan dan evaluasi bimbingan konseling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <Printer className="w-4 h-4" />
              Cetak PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-700/30"
            >
              <Download className="w-4 h-4" />
              Ekspor Excel
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
            >
              <option value="REKAP_PELAYANAN">Rekapitulasi Layanan Konseling</option>
              <option value="REKAP_ASESMEN">Rekapitulasi Hasil Asesmen AKPD</option>
              <option value="REKAP_KATEGORI">Rekapitulasi Kategori Permasalahan</option>
              <option value="REKAP_TINDAK_LANJUT">Rekapitulasi Tindak Lanjut & Home Visit</option>
              <option value="REKAP_RUJUKAN">Rekapitulasi Rujukan Wali Kelas</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Tahun Ajaran</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
            >
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Pratinjau Dokumen Laporan</span>
            <span className="text-slate-400">Total: {students.length} Record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-4">No</th>
                  <th className="p-4">NISN</th>
                  <th className="p-4">Nama Peserta Didik</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Status Asesmen</th>
                  <th className="p-4 text-center">Jumlah Sesi Konseling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s, idx) => (
                  <tr key={idx}>
                    <td className="p-4 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-4 font-bold">{s.nisn}</td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                    <td className="p-4 font-bold text-blue-600">{s.currentClass}</td>
                    <td className="p-4 font-medium text-emerald-600">{s.assessmentStatus}</td>
                    <td className="p-4 text-center font-bold">{s.counselingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
