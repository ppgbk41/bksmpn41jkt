'use client';

import React, { useState } from 'react';
import { Search, Download, ClipboardCheck, User, Users, BookOpen, Compass, Filter, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AkpdRekapTabProps {
  itemAnalysis: Record<string, { count: number; percentage: number; studentNames: string[]; severity: string }>;
  items: any[];
  studentSubmissions: any[];
  fieldDistribution: { Pribadi: number; Sosial: number; Belajar: number; Karier: number };
  topNeedsInClass: Array<{ code: string; text: string; category: string; count: number; pct: number }>;
}

export default function AkpdRekapTab({
  itemAnalysis,
  items,
  studentSubmissions,
  fieldDistribution,
  topNeedsInClass
}: AkpdRekapTabProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'per_butir' | 'per_siswa'>('ringkasan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [expandedItemCode, setExpandedItemCode] = useState<string | null>(null);

  // Filter items for Tab 2
  const filteredItems = items.filter(it => {
    const matchSearch = it.text.toLowerCase().includes(searchTerm.toLowerCase()) || it.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || it.category === selectedCategory;
    return matchSearch && matchCat;
  });

  // Filter students for Tab 3
  const filteredSubmissions = studentSubmissions.filter(sub => {
    const nameMatch = sub.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || sub.student?.nisn?.includes(searchTerm);
    return nameMatch;
  });

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = studentSubmissions.map(sub => {
      let selectedIdsCount = 0;
      try {
        selectedIdsCount = JSON.parse(sub.rawAnswers || '[]').length;
      } catch (e) {}

      return {
        'Nama Siswa': sub.student?.name,
        'NISN': sub.student?.nisn,
        'Kelas': sub.student?.currentClass?.name,
        'Tahun Ajaran': sub.academicYear,
        'Semester': sub.semester,
        'Status Kebutuhan': sub.dominantResult,
        'Jumlah Butir Terpilih': selectedIdsCount,
        'Interpretasi': sub.interpretation,
        'Rekomendasi Layanan BK': sub.recommendations,
        'Tanggal Submit': new Date(sub.createdAt).toLocaleDateString('id-ID')
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap AKPD Kelas');
    XLSX.writeFile(workbook, `Rekap_AKPD_BK_SMPN41_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      {/* Tab Navigation & Export Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {[
            { id: 'ringkasan', label: '1. Ringkasan' },
            { id: 'per_butir', label: '2. Per Butir Pernyataan' },
            { id: 'per_siswa', label: '3. Per Siswa' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel Rekap AKPD</span>
        </button>
      </div>

      {/* TAB 1: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Distribution per 4 fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: 'Bidang Pribadi', count: fieldDistribution.Pribadi, icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { title: 'Bidang Sosial', count: fieldDistribution.Sosial, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { title: 'Bidang Belajar', count: fieldDistribution.Belajar, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { title: 'Bidang Karier', count: fieldDistribution.Karier, icon: Compass, color: 'text-purple-500', bg: 'bg-purple-500/10' }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{f.title}</span>
                    <div className={`p-2 rounded-xl ${f.bg}`}>
                      <Icon className={`w-4 h-4 ${f.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{f.count}</p>
                  <p className="text-[10px] text-slate-400">Total Pilihan Siswa</p>
                </div>
              );
            })}
          </div>

          {/* Top 10 Needs in Class */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              10 Butir Kebutuhan Paling Banyak Dipilih dalam Kelas Ini:
            </h4>
            <div className="space-y-2">
              {topNeedsInClass.map((it, idx) => (
                <div key={it.code} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">[{it.code}]</span>
                        <span className="px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {it.category}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{it.text}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400 block">{it.count} Siswa</span>
                    <span className="text-[10px] text-slate-400">({it.pct}% Kelas)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PER BUTIR PERNYATAAN */}
      {activeTab === 'per_butir' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kata kunci butir atau kode (P01, S02)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter Bidang:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs outline-none font-bold"
              >
                <option value="all">Semua Bidang (40 Butir)</option>
                <option value="Pribadi">Pribadi</option>
                <option value="Sosial">Sosial</option>
                <option value="Belajar">Belajar</option>
                <option value="Karier">Karier</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredItems.map(it => {
              const analysis = itemAnalysis[it.id] || { count: 0, percentage: 0, studentNames: [], severity: 'NORMAL' };
              const isExpanded = expandedItemCode === it.id;

              return (
                <div key={it.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">[{it.id}]</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold rounded text-[10px]">
                          Bidang {it.category}
                        </span>
                        {analysis.severity === 'CRITICAL' && (
                          <span className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                            CRITICAL ITEM
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold">{it.text}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-sm text-blue-600 block">{analysis.count} Siswa</span>
                        <span className="text-[10px] text-slate-400">({analysis.percentage}% Pemilih)</span>
                      </div>
                      {analysis.count > 0 && (
                        <button
                          onClick={() => setExpandedItemCode(isExpanded ? null : it.id)}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Sembunyikan Daftar' : 'Lihat Daftar Siswa'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of students choosing this item */}
                  {isExpanded && (
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 pt-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                        Daftar Siswa yang Memilih Butir Ini ({analysis.studentNames.length} Siswa):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.studentNames.map((sName, sIdx) => (
                          <span key={sIdx} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-900 text-[11px] font-medium">
                            {sName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PER SISWA */}
      {activeTab === 'per_siswa' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Peserta Didik</th>
                  <th className="p-3.5">Status Kebutuhan</th>
                  <th className="p-3.5">Jumlah Butir Terpilih</th>
                  <th className="p-3.5">Interpretasi Profil</th>
                  <th className="p-3.5 text-center">Aksi Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubmissions.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data pengerjaan siswa yang sesuai.</td></tr>
                ) : (
                  filteredSubmissions.map((sub, idx) => {
                    let selectedCount = 0;
                    try { selectedCount = JSON.parse(sub.rawAnswers || '[]').length; } catch (e) {}

                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{sub.student?.name}</p>
                          <p className="text-[10px] text-slate-400">Kelas {sub.student?.currentClass?.name} • NISN: {sub.student?.nisn}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-lg inline-block text-[11px]">
                            {sub.dominantResult}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {selectedCount} Butir
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">
                          {sub.interpretation}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedStudentDetail(sub)}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl font-bold flex items-center justify-center gap-1 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Buka Detail Butir</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Siswa Butir Terpilih */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Rincian Butir AKPD: {selectedStudentDetail.student?.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Kelas {selectedStudentDetail.student?.currentClass?.name} • NISN: {selectedStudentDetail.student?.nisn}
                </p>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="px-3 py-1.5 bg-slate-800 text-white rounded-xl font-bold">Tutup</button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-200 block">Status Diagnostik:</span>
              <p className="text-slate-700 dark:text-slate-300">{selectedStudentDetail.interpretation}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Daftar Butir Pernyataan yang Tepat Dipilih Siswa:
              </h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(() => {
                  let ids: string[] = [];
                  try { ids = JSON.parse(selectedStudentDetail.rawAnswers || '[]'); } catch (e) {}
                  const selectedObjs = items.filter(it => ids.includes(it.id));

                  if (selectedObjs.length === 0) return <p className="text-slate-400">Tidak ada butir terpilih.</p>;

                  return selectedObjs.map((it, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border rounded-xl flex items-start gap-2 text-xs">
                      <span className="font-mono text-blue-600 font-bold">[{it.id}]</span>
                      <div>
                        <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-bold text-[10px] mr-1.5">
                          Bidang {it.category}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{it.text}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
