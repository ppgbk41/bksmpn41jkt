'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import StudentSelect from '@/components/common/StudentSelect';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  Lock,
  PhoneCall,
  MapPin,
  Calendar,
  X,
  RefreshCw,
  Printer,
  ChevronRight,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function SosBullyingPage() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Form Submit State
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    victimName: '',
    victimClass: '7A',
    category: 'Fisik',
    urgencyLevel: 'DARURAT',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: 'Kantin Sekolah',
    chronology: '',
    perpetrators: '',
    witnesses: '',
    isAnonymous: false,
    reporterName: '',
    reporterContact: ''
  });

  // Action / Resolution State
  const [actionForm, setActionForm] = useState({
    status: 'INVESTIGASI',
    handledBy: '',
    actionPlan: '',
    resolutionNotes: ''
  });

  useEffect(() => {
    fetchReports();
  }, [statusFilter, urgencyFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
        setActionForm(prev => ({ ...prev, handledBy: sData.user?.name || '' }));
      }

      let url = `/api/sos-bullying?status=${statusFilter}&urgency=${urgencyFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/sos-bullying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        fetchReports();
        alert(`Laporan Darurat ${data.reportNo} berhasil dikirim dan ditandai ke Tim BK!`);
        setFormData({
          victimName: '',
          victimClass: '7A',
          category: 'Fisik',
          urgencyLevel: 'DARURAT',
          incidentDate: new Date().toISOString().split('T')[0],
          incidentLocation: 'Kantin Sekolah',
          chronology: '',
          perpetrators: '',
          witnesses: '',
          isAnonymous: false,
          reporterName: '',
          reporterContact: ''
        });
      } else {
        alert(data.error || 'Gagal mengirim laporan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/sos-bullying', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          ...actionForm
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowActionModal(false);
        setShowDetailModal(false);
        fetchReports();
        alert('Tindak lanjut penanganan berhasil diperbarui!');
      } else {
        alert(data.error || 'Gagal memperbarui penanganan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const exportReportPdf = (r: any) => {
    const doc = new jsPDF();
    doc.setFont('helvetica');

    // Header KOP Surat
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.text('DINAS PENDIDIKAN - SMP NEGERI 41 JAKARTA', 105, 25, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Harsono RM No. 41, Ragunan, Pasar Minggu, Jakarta Selatan | Telp: (021) 7800041', 105, 31, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
    doc.setLineWidth(0.2);
    doc.line(15, 36, 195, 36);

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('BERITA ACARA TANGGAP DARURAT ANTI-PERUNDUNGAN (SOS BULLYING)', 105, 46, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nomor Laporan: ${r.reportNo} | Klasifikasi: RAHASIA & MENDESAK`, 105, 52, { align: 'center' });

    // Table Content
    (doc as any).autoTable({
      startY: 58,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      body: [
        ['Tingkat Urgensi', r.urgencyLevel],
        ['Status Penanganan', r.status],
        ['Nama Korban / Siswa', `${r.victimName} (Kelas ${r.victimClass})`],
        ['Kategori Perundungan', r.category],
        ['Waktu & Lokasi Kejadian', `${r.incidentDate} di ${r.incidentLocation}`],
        ['Terduga Pelaku', r.perpetrators || '-'],
        ['Saksi yang Melihat', r.witnesses || '-'],
        ['Status Pelapor', r.isAnonymous ? 'Anonim (Dirahasiakan)' : `${r.reporterName} (${r.reporterRole})`],
        ['Kronologi Kejadian', r.chronology],
        ['Petugas Penanganan', r.handledBy || 'Tim BK & TPPK SMPN 41 Jakarta'],
        ['Rencana Tindakan', r.actionPlan || 'Dalam proses investigasi dan pendampingan psikologis.'],
        ['Catatan Hasil Mediasi', r.resolutionNotes || 'Belum selesai / Masih berlangsung.']
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.text('Jakarta, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 140, finalY);
    doc.text('Koordinator BK / Tim TPPK,', 140, finalY + 6);
    doc.text('SMP Negeri 41 Jakarta', 140, finalY + 12);
    doc.text('(________________________)', 140, finalY + 35);

    doc.save(`Berita_Acara_SOS_${r.reportNo}.pdf`);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.reportNo.toLowerCase().includes(search.toLowerCase()) ||
      r.victimName.toLowerCase().includes(search.toLowerCase()) ||
      r.victimClass.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header Alert Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 p-6 rounded-3xl border border-red-900/60 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/40 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Pusat Tanggap Darurat SOS Bullying & Anti-Kekerasan
                </h1>
                <p className="text-xs text-red-200/80 mt-0.5">
                  Sistem Pelaporan dan Penanganan Cepat Kasus Perundungan SMP Negeri 41 Jakarta.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Buat Laporan SOS Baru
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Laporan Darurat</p>
              <p className="text-base font-bold text-red-600 dark:text-red-400">
                {stats?.urgentCount ?? 0} Kasus
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Laporan Baru</p>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                {stats?.newCount ?? 0} Laporan
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Dalam Penanganan</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                {stats?.inProgressCount ?? 0} Kasus
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Kasus Terselesaikan</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {stats?.resolvedCount ?? 0} Selesai
              </p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {[
                { id: 'ALL', label: 'Semua Status' },
                { id: 'BARU', label: 'Laporan Baru' },
                { id: 'INVESTIGASI', label: 'Investigasi' },
                { id: 'MEDIASI', label: 'Mediasi / Konseling' },
                { id: 'SELESAI', label: 'Selesai' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    statusFilter === tab.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              <option value="ALL">Semua Urgensi</option>
              <option value="DARURAT">🚨 Urgensi Darurat</option>
              <option value="TINGGI">⚠️ Urgensi Tinggi</option>
              <option value="SEDANG">🟡 Urgensi Sedang</option>
            </select>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari No. Laporan, Nama Korban, atau Kelas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Reports Feed & Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400">
              Memuat data laporan SOS Bullying...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Tidak Ada Laporan Bullying Aktif
              </h3>
              <p className="text-xs text-slate-400">
                Situasi terpantau aman dan kondusif.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredReports.map((r) => {
                const isUrgent = r.urgencyLevel === 'DARURAT';

                return (
                  <div
                    key={r.id}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all hover:shadow-md ${
                      isUrgent
                        ? 'border-red-500/80 dark:border-red-500/60 ring-1 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-xs text-red-600 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-800">
                            {r.reportNo}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.urgencyLevel === 'DARURAT'
                              ? 'bg-red-600 text-white animate-pulse'
                              : r.urgencyLevel === 'TINGGI'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {r.urgencyLevel === 'DARURAT' ? '🚨 DARURAT' : r.urgencyLevel}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {r.category}
                          </span>

                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(r.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            Korban: <span className="text-blue-600 dark:text-blue-400">{r.victimName}</span> (Kelas {r.victimClass})
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            "{r.chronology}"
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {r.incidentLocation} ({r.incidentDate})
                          </span>

                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-emerald-500" />
                            Pelapor: <b>{r.isAnonymous ? 'Anonim (Dirahasiakan)' : r.reporterName}</b>
                          </span>

                          {r.perpetrators && (
                            <span className="text-red-500">
                              Terduga: <b>{r.perpetrators}</b>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setShowDetailModal(true);
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Detail Kasus
                        </button>

                        <button
                          onClick={() => exportReportPdf(r)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Cetak Berita Acara PDF"
                        >
                          <Printer className="w-4 h-4" />
                          PDF
                        </button>

                        {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setActionForm({
                                status: r.status,
                                handledBy: r.handledBy || user?.name || '',
                                actionPlan: r.actionPlan || '',
                                resolutionNotes: r.resolutionNotes || ''
                              });
                              setShowActionModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
                          >
                            <HeartHandshake className="w-4 h-4" />
                            Tanggapi & Tindak Lanjut
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal 1: Buat Laporan SOS Bullying Baru */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Form Laporan Darurat SOS Bullying
                  </h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl">
                  <p className="text-[11px] text-red-800 dark:text-red-300 font-semibold">
                    🔒 Laporan Anda dilindungi asas kerahasiaan BK SMPN 41 Jakarta. Jika Anda memilih mode Anonim, identitas Anda tidak akan ditampilkan kepada siapa pun.
                  </p>
                </div>

                <div>
                  <StudentSelect
                    value={(formData as any).victimStudentId || ''}
                    onChange={(id, student) => {
                      if (student) {
                        setFormData({
                          ...formData,
                          victimName: student.name,
                          victimClass: student.className,
                          ...( { victimStudentId: student.id } as any )
                        });
                      }
                    }}
                    label="Pilih Peserta Didik Korban (Cari Cepat Nama / Kelas)"
                    placeholder="Ketik nama murid, NIS, atau filter kelas (7A-9G)..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Nama Korban / Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama korban..."
                      value={formData.victimName}
                      onChange={(e) => setFormData({ ...formData, victimName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Kelas Korban *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 7A, 8B"
                      value={formData.victimClass}
                      onChange={(e) => setFormData({ ...formData, victimClass: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Kategori Perundungan *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value="Fisik">Perundungan Fisik (Kekerasan / Pemukulan)</option>
                      <option value="Verbal">Perundungan Verbal (Mengejek / Menghina)</option>
                      <option value="Siber / Media Sosial">Cyberbullying (Medsos / Chat / WhatsApp)</option>
                      <option value="Sosial / Pengucilan">Sosial (Pengucilan / Diskriminasi)</option>
                      <option value="Pemerasan">Pemerasan Uang / Barang</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tingkat Urgensi *</label>
                    <select
                      value={formData.urgencyLevel}
                      onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold text-red-600"
                    >
                      <option value="DARURAT">🚨 DARURAT (Butuh Bantuan Segera)</option>
                      <option value="TINGGI">⚠️ TINGGI (Perlu Penanganan Cepat)</option>
                      <option value="SEDANG">🟡 SEDANG (Pemantauan & Mediasi)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Tanggal Kejadian</label>
                    <input
                      type="date"
                      value={formData.incidentDate}
                      onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Lokasi Kejadian</label>
                    <input
                      type="text"
                      placeholder="Kantin, Kamar Mandi, Medsos, dll"
                      value={formData.incidentLocation}
                      onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Terduga Pelaku (Jika Tahu)</label>
                    <input
                      type="text"
                      placeholder="Nama pelaku..."
                      value={formData.perpetrators}
                      onChange={(e) => setFormData({ ...formData, perpetrators: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Saksi Mata (Jika Ada)</label>
                    <input
                      type="text"
                      placeholder="Nama saksi..."
                      value={formData.witnesses}
                      onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Kronologi Kejadian Cerita Lengkap *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ceritakan bagaimana peristiwa terjadi secara rinci..."
                    value={formData.chronology}
                    onChange={(e) => setFormData({ ...formData, chronology: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                {/* Anonymous Option */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="rounded text-red-600 w-4 h-4"
                    />
                    <span>Kirim sebagai Pelapor Anonim (Sembunyikan Identitas Saya)</span>
                  </label>

                  {!formData.isAnonymous && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        placeholder="Nama Pelapor"
                        value={formData.reporterName}
                        onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                        className="px-3 py-1.5 border rounded-xl dark:bg-slate-900 text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="No HP / WhatsApp Pelapor"
                        value={formData.reporterContact}
                        onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                        className="px-3 py-1.5 border rounded-xl dark:bg-slate-900 text-[11px]"
                      />
                    </div>
                  )}
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
                    disabled={submitting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengirim Laporan...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        Kirim Laporan Darurat
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Detail Kasus Lengkap */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8 text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                    {selectedReport.reportNo}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Detail Kasus Perundungan
                  </h3>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400">Nama Korban</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {selectedReport.victimName} (Kelas {selectedReport.victimClass})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Kategori & Urgensi</span>
                    <p className="font-bold text-red-600">
                      {selectedReport.category} ({selectedReport.urgencyLevel})
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400">Kronologi Kejadian:</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.chronology}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 border rounded-xl dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Terduga Pelaku</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.perpetrators || '-'}</span>
                  </div>
                  <div className="p-2.5 border rounded-xl dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Saksi Mata</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReport.witnesses || '-'}</span>
                  </div>
                </div>

                {/* Tindak Lanjut Info */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900 dark:text-blue-200">Status Penanganan:</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-600 text-white">
                      {selectedReport.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Petugas BK: <b>{selectedReport.handledBy || 'Belum ditugaskan'}</b>
                  </p>
                  {selectedReport.actionPlan && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-300">
                      <b>Rencana Aksi:</b> {selectedReport.actionPlan}
                    </div>
                  )}
                  {selectedReport.resolutionNotes && (
                    <div className="text-[11px] text-slate-700 dark:text-slate-300">
                      <b>Catatan Penyelesaian:</b> {selectedReport.resolutionNotes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => exportReportPdf(selectedReport)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Berita Acara
                </button>

                <div className="flex items-center gap-2">
                  {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setActionForm({
                          status: selectedReport.status,
                          handledBy: selectedReport.handledBy || user?.name || '',
                          actionPlan: selectedReport.actionPlan || '',
                          resolutionNotes: selectedReport.resolutionNotes || ''
                        });
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                    >
                      Update Penanganan
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Update Tindak Lanjut Penanganan Kasus */}
        {showActionModal && selectedReport && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Update Penanganan {selectedReport.reportNo}
                </h3>
                <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateAction} className="space-y-3">
                <div>
                  <label className="font-bold block mb-1">Status Progres Kasus</label>
                  <select
                    value={actionForm.status}
                    onChange={(e) => setActionForm({ ...actionForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold"
                  >
                    <option value="INVESTIGASI">🔎 Dalam Investigasi / Pengumpulan Fakta</option>
                    <option value="MEDIASI">🤝 Mediasi & Konseling Korban-Pelaku</option>
                    <option value="DIRUJUK_TPPK">⚖️ Dirujuk ke Tim TPPK / Pihak Berwenang</option>
                    <option value="SELESAI">✅ Kasus Selesai & Ditutup</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Guru BK / Konselor yang Menangani</label>
                  <input
                    type="text"
                    required
                    value={actionForm.handledBy}
                    onChange={(e) => setActionForm({ ...actionForm, handledBy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Rencana Aksi / Pendampingan</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Pemanggilan wali kelas, konseling individu korban, pembinaan pelaku..."
                    value={actionForm.actionPlan}
                    onChange={(e) => setActionForm({ ...actionForm, actionPlan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Catatan Hasil Mediasi / Rekomendasi</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan kesepakatan damai, sanksi pembinaan, atau monitoring lanjutan..."
                    value={actionForm.resolutionNotes}
                    onChange={(e) => setActionForm({ ...actionForm, resolutionNotes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md"
                  >
                    Simpan Progres Kasus
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
