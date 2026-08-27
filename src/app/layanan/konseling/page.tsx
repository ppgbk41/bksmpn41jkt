'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MapPin,
  User,
  CalendarCheck,
  Phone,
  FileText,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function KonselingManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'CALENDAR' | 'TABLE'>('CALENDAR');

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Modals & Selected Application
  const [selectedScheduleModal, setSelectedScheduleModal] = useState<any>(null);
  const [selectedDetailModal, setSelectedDetailModal] = useState<any>(null);

  // Status Filter for Table View
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scheduling Form
  const [scheduleData, setScheduleData] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 - 09:45 WIB',
    location: 'Ruang BK Utama',
    notes: ''
  });

  useEffect(() => {
    fetchSessionAndRegistrations();
  }, []);

  const fetchSessionAndRegistrations = async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/konseling/pendaftaran');
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleModal) return;

    try {
      const res = await fetch('/api/konseling/pendaftaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedScheduleModal.id,
          status: 'Sudah Dijadwalkan',
          ...scheduleData
        })
      });

      if (res.ok) {
        setSelectedScheduleModal(null);
        fetchSessionAndRegistrations();
        alert('Jadwal konseling berhasil dikonfirmasi dan notifikasi telah dikirim ke siswa!');
      } else {
        alert('Gagal menjadwalkan konseling');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
  };

  // Calendar Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const firstDayOfMonth = new Date(year, month, 1);
  // Get day index with Monday = 0 (0: Mon, 1: Tue, ..., 6: Sun)
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  // Generate calendar grid dates
  const calendarCells = [];

  // Padding days from previous month
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: true
    });
  }

  // Padding days for next month to complete 35 or 42 grid
  const totalCells = calendarCells.length <= 35 ? 35 : 42;
  const remaining = totalCells - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateString: dateStr,
      isCurrentMonth: false
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Map registrations to dateString
  const getEventsForDate = (dateStr: string) => {
    return registrations.filter(r => {
      if (r.preferredDate === dateStr) return true;
      if (r.schedules && r.schedules.some((s: any) => s.date === dateStr)) return true;
      return false;
    });
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issueCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header Title & Navigation Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-blue-800/40 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Pusat Penjadwalan Konseling
              </span>
              <span className="text-xs text-slate-300 font-medium">SMP Negeri 41 Jakarta</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Kalender Interaktif & Permohonan Konseling</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Visualisasi jadwal bimbingan konseling harian & bulanan. Klik tanggal atau slot sesi untuk melihat rincian dan konfirmasi jadwal.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => setActiveView('CALENDAR')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeView === 'CALENDAR'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Kalender Interaktif</span>
            </button>
            <button
              onClick={() => setActiveView('TABLE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeView === 'TABLE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Permohonan ({registrations.length})</span>
            </button>
          </div>
        </div>

        {/* View 1: Interactive Full Calendar */}
        {activeView === 'CALENDAR' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Calendar Controls & Month Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  <span>{monthNames[month]} {year}</span>
                </h2>
                <button
                  onClick={todayMonth}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Bulan Ini
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Legend Chips */}
                <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500 mr-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sudah Terjadwal
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Menunggu Konfirmasi
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Mendesak
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 7-Days Calendar Grid */}
            <div className="space-y-2">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
                <span>Senin</span>
                <span>Selasa</span>
                <span>Rabu</span>
                <span>Kamis</span>
                <span>Jumat</span>
                <span className="text-amber-500">Sabtu</span>
                <span className="text-red-500">Minggu</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((cell, idx) => {
                  const isToday = cell.dateString === todayStr;
                  const dayEvents = getEventsForDate(cell.dateString);

                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                        cell.isCurrentMonth
                          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 hover:border-blue-400/60'
                          : 'bg-slate-100/30 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800/40 text-slate-400 opacity-60'
                      } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/20' : ''}`}
                    >
                      {/* Day Header */}
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${
                          isToday
                            ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                            : cell.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}>
                          {cell.dayNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {dayEvents.length} Sesi
                          </span>
                        )}
                      </div>

                      {/* Event Chips List */}
                      <div className="space-y-1 overflow-y-auto max-h-[85px]">
                        {dayEvents.map((ev, eIdx) => {
                          const isUrgent = ev.urgencyLevel?.includes('Mendesak');
                          const isScheduled = ev.status === 'Sudah Dijadwalkan' || ev.status === 'Terjadwal';

                          return (
                            <div
                              key={eIdx}
                              onClick={() => setSelectedDetailModal(ev)}
                              className={`p-1.5 rounded-xl text-[10px] font-semibold cursor-pointer transition-all hover:scale-[1.02] shadow-xs flex flex-col gap-0.5 ${
                                isUrgent
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : isScheduled
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                              }`}
                              title={`${ev.studentName} (${ev.className}) - ${ev.issueCategory} (${ev.preferredTime})`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold truncate">{ev.studentName}</span>
                                <span className="text-[8px] opacity-80 shrink-0">{ev.className}</span>
                              </div>
                              <div className="text-[9px] opacity-90 truncate flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                <span>{ev.preferredTime || '09:00 WIB'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Traditional Table View with Search & Status Filters */}
        {activeView === 'TABLE' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Table Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {[
                  { id: 'ALL', label: 'Semua Status' },
                  { id: 'Baru', label: 'Menunggu Persetujuan' },
                  { id: 'Sudah Dijadwalkan', label: 'Sudah Terjadwal' },
                  { id: 'Selesai', label: 'Selesai' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      statusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa, nomor reg, atau kategori..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b">
                  <tr>
                    <th className="p-4">No. Registrasi</th>
                    <th className="p-4">Peserta Didik</th>
                    <th className="p-4">Kategori & Urgensi</th>
                    <th className="p-4">Waktu Diminta</th>
                    <th className="p-4">Konselor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Tidak ada permohonan konseling yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 font-bold text-blue-600">{r.registrationNo}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{r.studentName}</p>
                          <span className="text-[11px] text-slate-500">Kelas {r.className}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{r.issueCategory}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                            r.urgencyLevel?.includes('Mendesak')
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {r.urgencyLevel}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200">{r.preferredDate}</p>
                          <span className="text-[10px] text-slate-400">{r.preferredTime} ({r.mode})</span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                          {r.bkTeacherName || 'Dra. Hj. Siti Aminah, M.Pd.'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            r.status === 'Sudah Dijadwalkan'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : r.status === 'Baru'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {['ADMIN', 'GURU_BK'].includes(user?.role) && r.status === 'Baru' && (
                              <button
                                onClick={() => {
                                  setSelectedScheduleModal(r);
                                  setScheduleData({
                                    date: r.preferredDate || new Date().toISOString().split('T')[0],
                                    timeSlot: r.preferredTime || '09:00 - 09:45 WIB',
                                    location: 'Ruang BK Utama',
                                    notes: ''
                                  });
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-[11px]"
                              >
                                Setujui & Jadwalkan
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedDetailModal(r)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                              title="Lihat Detail Permohonan"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal 1: Detail Permohonan & Sesi Konseling */}
        {selectedDetailModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Rincian Sesi Konseling ({selectedDetailModal.registrationNo})
                  </h3>
                </div>
                <button onClick={() => setSelectedDetailModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Nama Peserta Didik</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {selectedDetailModal.studentName}
                    </p>
                    <span className="text-[11px] text-slate-500">Kelas {selectedDetailModal.className}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedDetailModal.status === 'Sudah Dijadwalkan'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {selectedDetailModal.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 border rounded-xl dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kategori Masalah</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDetailModal.issueCategory}</span>
                  </div>
                  <div className="p-2.5 border rounded-xl dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tingkat Urgensi</span>
                    <span className="font-bold text-red-600">{selectedDetailModal.urgencyLevel}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">Gambaran Kondisi Konseli:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    "{selectedDetailModal.description}"
                  </p>
                </div>

                <div className="p-3 border rounded-2xl dark:border-slate-800 space-y-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Waktu: <b>{selectedDetailModal.preferredDate} ({selectedDetailModal.preferredTime})</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mode: <b>{selectedDetailModal.mode || 'Tatap Muka di Ruang BK'}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Konselor: <b>{selectedDetailModal.bkTeacherName || 'Dra. Hj. Siti Aminah, M.Pd.'}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {['ADMIN', 'GURU_BK'].includes(user?.role) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const target = selectedDetailModal;
                        setSelectedDetailModal(null);
                        setSelectedScheduleModal(target);
                        setScheduleData({
                          date: target.preferredDate || new Date().toISOString().split('T')[0],
                          timeSlot: target.preferredTime || '09:00 - 09:45 WIB',
                          location: 'Ruang BK Utama',
                          notes: ''
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      {selectedDetailModal.status === 'Baru' ? 'Setujui Jadwal' : 'Ubah Jadwal'}
                    </button>

                    <Link
                      href={`/catatan-konseling?studentId=${selectedDetailModal.studentId}`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      Buka Catatan Sesi
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => setSelectedDetailModal(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 dark:text-slate-400"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Form Konfirmasi / Penjadwalan */}
        {selectedScheduleModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Konfirmasi Jadwal Sesi Konseling
                </h3>
                <button onClick={() => setSelectedScheduleModal(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                  <p className="text-slate-600 dark:text-slate-300">
                    Siswa: <strong>{selectedScheduleModal.studentName}</strong> (Kelas {selectedScheduleModal.className})
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Kategori: {selectedScheduleModal.issueCategory} • Permintaan Awal: {selectedScheduleModal.preferredDate} ({selectedScheduleModal.preferredTime})
                  </p>
                </div>

                <div>
                  <label className="block font-bold mb-1">Tanggal Konseling Terpilih *</label>
                  <input
                    type="date"
                    required
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Slot Waktu / Jam *</label>
                  <input
                    type="text"
                    required
                    value={scheduleData.timeSlot}
                    onChange={(e) => setScheduleData({ ...scheduleData, timeSlot: e.target.value })}
                    placeholder="09:00 - 09:45 WIB"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Lokasi Sesi Konseling *</label>
                  <input
                    type="text"
                    required
                    value={scheduleData.location}
                    onChange={(e) => setScheduleData({ ...scheduleData, location: e.target.value })}
                    placeholder="Ruang BK Utama / Ruang Konseling 1"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Catatan Tambahan untuk Siswa (Opsional)</label>
                  <textarea
                    rows={2}
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                    placeholder="Contoh: Harap hadir tepat waktu dan membawa buku catatan..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedScheduleModal(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/30"
                  >
                    Konfirmasi & Kirim Jadwal
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
