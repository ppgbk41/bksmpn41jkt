'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldAlert,
  Lock,
  HeartHandshake,
  Send,
  X,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';

export default function MuridPortalPage() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [sosReports, setSosReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'konseling' | 'sos'>('konseling');

  // SOS Bullying Modal State
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSubmitting, setSosSubmitting] = useState(false);
  const [sosForm, setSosForm] = useState({
    victimName: '',
    victimClass: '',
    category: 'Fisik',
    urgencyLevel: 'DARURAT',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentLocation: 'Lingkungan Sekolah',
    chronology: '',
    perpetrators: '',
    witnesses: '',
    isAnonymous: true,
    reporterContact: ''
  });

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const fetchSessionAndData = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
        setSosForm(prev => ({
          ...prev,
          victimName: sData.user?.name || '',
          reporterContact: sData.user?.username || ''
        }));
      }

      const regRes = await fetch('/api/konseling/pendaftaran');
      if (regRes.ok) {
        const data = await regRes.json();
        setRegistrations(data.registrations || []);
      }

      const sosRes = await fetch('/api/sos-bullying');
      if (sosRes.ok) {
        const data = await sosRes.json();
        setSosReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSosSubmitting(true);
      const res = await fetch('/api/sos-bullying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sosForm,
          victimStudentId: user?.studentId || null,
          reporterName: sosForm.isAnonymous ? 'Anonim' : user?.name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSosModal(false);
        fetchSessionAndData();
        setActiveTab('sos');
        alert(`🚨 Laporan SOS Bullying (${data.reportNo}) berhasil dikirim. Guru BK akan segera merespons secara aman.`);
      } else {
        alert(data.error || 'Gagal mengirim laporan');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan saat mengirim laporan');
    } finally {
      setSosSubmitting(false);
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-blue-800/40 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Portal Siswa Terintegrasi SMPN 41 Jakarta
            </span>
            <h1 className="text-xl font-bold mt-1.5">Selamat Datang, {user?.name}!</h1>
            <p className="text-xs text-slate-300">NIS / Akun: {user?.nipNis || user?.username}</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSosModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/40 animate-pulse hover:scale-105 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>🚨 SOS Bullying</span>
            </button>

            <Link
              href="/layanan/daftar"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftar Konseling</span>
            </Link>
          </div>
        </div>

        {/* AKPD Assessment Action Card */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 border border-purple-800/40 rounded-3xl p-5 shadow-xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/30 text-purple-200 border border-purple-500/40">
                  AKPD Online Terstandar
                </span>
                <span className="text-xs text-purple-300">Tahun Ajaran 2025/2026</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Asesmen Kebutuhan Peserta Didik (AKPD)
              </h3>
              <p className="text-[11px] text-purple-200/90 max-w-xl">
                Isi angket kebutuhan 4 Bidang Layanan (Pribadi, Sosial, Belajar, Karier) agar Guru BK dapat memberikan bimbingan yang tepat sasaran.
              </p>
            </div>
          </div>

          <Link
            href="/murid/asesmen/akpd"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-600/40 shrink-0 transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Isi Asesmen AKPD ➔</span>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('konseling')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'konseling'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Permohonan Konseling Saya ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('sos')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sos'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Laporan SOS Bullying Saya ({sosReports.length})
          </button>
        </div>

        {/* Tab 1: Konseling */}
        {activeTab === 'konseling' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b pb-2">
              Status Permohonan Konseling Saya
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Memuat status pendaftaran...</div>
            ) : registrations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                Anda belum memiliki permohonan konseling aktif. Klik tombol "+ Daftar Konseling" jika membutuhkan bimbingan Guru BK.
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((r, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{r.registrationNo}</span>
                        <p className="text-[11px] text-slate-500">Kategori: {r.issueCategory} • Konselor: {r.bkTeacherName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Sudah Dijadwalkan'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : r.status === 'Baru'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">Deskripsi: {r.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 border-t pt-2">
                      <span>Pengajuan: {r.preferredDate} jam {r.preferredTime}</span>
                      <span>Mode: {r.mode}</span>
                      <span>Tingkat Urgensi: <strong>{r.urgencyLevel}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SOS Bullying Reports */}
        {activeTab === 'sos' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Daftar Pengaduan Darurat SOS Bullying Anda
              </h2>
              <button
                onClick={() => setShowSosModal(true)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                + Buat Laporan Darurat
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Memuat laporan SOS...</div>
            ) : sosReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-2xl space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Anda belum mengirimkan laporan SOS Bullying.</p>
                <p className="text-[11px] text-slate-500">
                  Jika Anda atau teman Anda mengalami perundungan (verbal, fisik, siber), jangan ragu untuk melapor. Identitas Anda aman.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sosReports.map((r, idx) => (
                  <div key={idx} className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-600">{r.reportNo}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                            {r.urgencyLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800">
                            {r.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Korban: <b>{r.victimName}</b> ({r.victimClass}) • Lokasi: {r.incidentLocation}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'SELESAI'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{r.chronology}"
                    </p>

                    {r.actionPlan && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-900 dark:text-blue-300">
                        <b>Respon Guru BK:</b> {r.actionPlan}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center justify-between border-t pt-2">
                      <span>Tanggal Lapor: {new Date(r.createdAt).toLocaleDateString('id-ID')}</span>
                      <span>Petugas: {r.handledBy || 'Tim BK Sedang Meninjau'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Buat Laporan SOS Bullying Murid */}
        {showSosModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-red-500/50 shadow-2xl space-y-4 my-8 text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Lapor Darurat Anti-Bullying (SOS)
                  </h3>
                </div>
                <button onClick={() => setShowSosModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSosSubmit} className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl">
                  <p className="text-[11px] text-red-800 dark:text-red-300">
                    🛡️ <b>Anda Aman Bersama Kami:</b> Laporan ini langsung masuk ke Guru BK SMPN 41 Jakarta. Identitas Anda dirahasiakan sepenuhnya.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Nama Korban *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda atau teman..."
                      value={sosForm.victimName}
                      onChange={(e) => setSosForm({ ...sosForm, victimName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Kelas Korban *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 7A, 8B"
                      value={sosForm.victimClass}
                      onChange={(e) => setSosForm({ ...sosForm, victimClass: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold block mb-1">Bentuk Perundungan *</label>
                    <select
                      value={sosForm.category}
                      onChange={(e) => setSosForm({ ...sosForm, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    >
                      <option value="Fisik">Kekerasan Fisik / Pemukulan</option>
                      <option value="Verbal">Kata-kata Kasar / Ejekan / Menghina</option>
                      <option value="Siber / Media Sosial">Cyberbullying / WhatsApp / Medsos</option>
                      <option value="Sosial / Pengucilan">Pengucilan / Dijauhi Teman</option>
                      <option value="Pemerasan">Pemerasan Uang / Barang</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Tingkat Kegawatan *</label>
                    <select
                      value={sosForm.urgencyLevel}
                      onChange={(e) => setSosForm({ ...sosForm, urgencyLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 font-bold text-red-600"
                    >
                      <option value="DARURAT">🚨 DARURAT (Butuh Bantuan Segera)</option>
                      <option value="TINGGI">⚠️ TINGGI (Perlu Tindakan Cepat)</option>
                      <option value="SEDANG">🟡 SEDANG (Konseling & Mediasi)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Lokasi Kejadian</label>
                    <input
                      type="text"
                      placeholder="Kelas, Kantin, Medsos, dll"
                      value={sosForm.incidentLocation}
                      onChange={(e) => setSosForm({ ...sosForm, incidentLocation: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Pelaku (Jika Tahu)</label>
                    <input
                      type="text"
                      placeholder="Nama pelaku..."
                      value={sosForm.perpetrators}
                      onChange={(e) => setSosForm({ ...sosForm, perpetrators: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Ceritakan Kejadiannya *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ceritakan apa yang terjadi..."
                    value={sosForm.chronology}
                    onChange={(e) => setSosForm({ ...sosForm, chronology: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={sosForm.isAnonymous}
                      onChange={(e) => setSosForm({ ...sosForm, isAnonymous: e.target.checked })}
                      className="rounded text-red-600 w-4 h-4"
                    />
                    <span>Kirim Laporan secara Anonim (Nama saya dirahasiakan)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowSosModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={sosSubmitting}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/40"
                  >
                    {sosSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Laporan Sekarang
                      </>
                    )}
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
