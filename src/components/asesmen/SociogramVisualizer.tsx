'use client';

import React, { useState } from 'react';
import { Users, Star, UserX, HeartHandshake, Eye, ShieldCheck, Grid, Share2 } from 'lucide-react';

interface SociogramVisualizerProps {
  classStudents: Array<{ id: string; name: string; nisn: string; gender?: string }>;
  analysis: {
    matrix: Record<string, Record<string, number>>;
    choiceCounts: Record<string, number>;
    mutualPairs: Array<{ student1: string; student2: string; student1Name: string; student2Name: string }>;
    starStudents: string[];
    isolatedStudents: string[];
  };
}

export default function SociogramVisualizer({ classStudents, analysis }: SociogramVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'sociogram' | 'matrix' | 'mutual' | 'isolated'>('sociogram');
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  // Calculate circular layout coordinates for Sociogram SVG Canvas
  const width = 650;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 70;

  const nodeCoords: Record<string, { x: number; y: number; angle: number }> = {};
  const total = classStudents.length;

  classStudents.forEach((student, index) => {
    const angle = (index / (total || 1)) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodeCoords[student.id] = { x, y, angle };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
      {/* Privacy Alert */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="font-semibold">
          <strong>Kerahasiaan Data Sosiometri:</strong> Pilihan sosiometri bersifat rahasia dan hanya dapat diakses oleh Guru BK. Siswa tidak dapat melihat siapa yang memilih mereka.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'sociogram', label: '1. Diagram Sociogram (Jaringan)', icon: Share2 },
          { id: 'matrix', label: '2. Matriks Sosiometri', icon: Grid },
          { id: 'mutual', label: '3. Mutual Relationship (Saling Memilih)', icon: HeartHandshake },
          { id: 'isolated', label: '4. Siswa Terisolasi / Perlu Perhatian', icon: UserX }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VISUALISASI SOCIOGRAM (SVG NETWORK) */}
      {activeTab === 'sociogram' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 inline-block" />
                <span className="font-bold">Siswa Populer (Star Node)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 border border-red-600 inline-block" />
                <span className="font-bold">Siswa Terisolasi (Low Choice)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span>Siswa Standar</span>
              </span>
            </div>
            <span className="text-slate-400">Arahkan kursor pada nama siswa untuk menyorot koneksi pilihan</span>
          </div>

          <div className="bg-slate-950 rounded-3xl p-4 flex justify-center overflow-x-auto shadow-inner">
            <svg width={width} height={height} className="max-w-full">
              {/* Grid concentric circles */}
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

              {/* Draw choice lines */}
              {classStudents.map(fromS => {
                const fromCoord = nodeCoords[fromS.id];
                if (!fromCoord) return null;

                return classStudents.map(toS => {
                  const choiceVal = analysis.matrix[fromS.id]?.[toS.id] || 0;
                  if (choiceVal === 0) return null;

                  const toCoord = nodeCoords[toS.id];
                  if (!toCoord) return null;

                  const isHighlighted = hoveredStudentId === fromS.id || hoveredStudentId === toS.id;
                  const strokeColor = isHighlighted ? '#38bdf8' : '#334155';
                  const strokeWidth = isHighlighted ? 2.5 : 1;
                  const opacity = hoveredStudentId ? (isHighlighted ? 1 : 0.15) : 0.4;

                  return (
                    <line
                      key={`${fromS.id}-${toS.id}`}
                      x1={fromCoord.x}
                      y1={fromCoord.y}
                      x2={toCoord.x}
                      y2={toCoord.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                    />
                  );
                });
              })}

              {/* Draw Student Nodes */}
              {classStudents.map(student => {
                const coord = nodeCoords[student.id];
                if (!coord) return null;

                const count = analysis.choiceCounts[student.id] || 0;
                const isStar = analysis.starStudents.includes(student.id);
                const isIsolated = analysis.isolatedStudents.includes(student.id);

                let fill = '#3b82f6';
                if (isStar) fill = '#f59e0b';
                if (isIsolated) fill = '#ef4444';

                const nodeRadius = Math.max(14, Math.min(26, 14 + count * 2));

                return (
                  <g
                    key={student.id}
                    onMouseEnter={() => setHoveredStudentId(student.id)}
                    onMouseLeave={() => setHoveredStudentId(null)}
                    className="cursor-pointer transition-all hover:scale-110"
                  >
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={nodeRadius}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="shadow-lg"
                    />
                    <text
                      x={coord.x}
                      y={coord.y + 4}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {count}
                    </text>
                    <text
                      x={coord.x}
                      y={coord.y > centerY ? coord.y + nodeRadius + 14 : coord.y - nodeRadius - 6}
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {student.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS SOSIOMETRI */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Angka dalam tabel menunjukkan urutan pilihan (Pilihan 1, 2, atau 3) dari siswa pemilih (baris) kepada siswa terpilih (kolom).
          </p>
          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-3 border font-bold">Pemilih \ Terpilih</th>
                  {classStudents.map(s => (
                    <th key={s.id} className="p-2 border text-center font-bold text-[10px] min-w-[70px]">
                      {s.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="p-2 border text-center bg-blue-100 dark:bg-blue-950 font-extrabold text-blue-700 dark:text-blue-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map(fromS => (
                  <tr key={fromS.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2 border font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {fromS.name}
                    </td>
                    {classStudents.map(toS => {
                      const val = analysis.matrix[fromS.id]?.[toS.id] || 0;
                      const isSelf = fromS.id === toS.id;

                      return (
                        <td
                          key={toS.id}
                          className={`p-2 border text-center font-bold ${
                            isSelf
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              : val > 0
                              ? 'bg-blue-500 text-white shadow-xs'
                              : 'text-slate-300'
                          }`}
                        >
                          {isSelf ? '-' : val > 0 ? `P${val}` : '0'}
                        </td>
                      );
                    })}
                    <td className="p-2 border text-center font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {analysis.choiceCounts[fromS.id] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MUTUAL RELATIONSHIP */}
      {activeTab === 'mutual' && (
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Daftar Pasangan Siswa yang Saling Memilih (Mutual Relationship):
          </h4>
          {analysis.mutualPairs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">Belum ada pasangan siswa yang saling memilih.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {analysis.mutualPairs.map((pair, idx) => (
                <div key={idx} className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {pair.student1Name} <span className="text-emerald-600">↔</span> {pair.student2Name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full">Mutual Link</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SISWA TERISOLASI */}
      {activeTab === 'isolated' && (
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Daftar Siswa dengan Jumlah Pilihan Rendah (Potensi Terisolasi / Memerlukan Pendampingan):
          </h4>
          {analysis.isolatedStudents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">Semua siswa mendapatkan pilihan yang seimbang.</div>
          ) : (
            <div className="space-y-2 text-xs">
              {analysis.isolatedStudents.map(studentId => {
                const student = classStudents.find(s => s.id === studentId);
                const count = analysis.choiceCounts[studentId] || 0;

                return (
                  <div key={studentId} className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-red-950 dark:text-red-200 text-sm">{student?.name}</h5>
                      <p className="text-red-700 dark:text-red-300">Menerima: {count} Pilihan dari teman sekelas</p>
                    </div>
                    <span className="px-3 py-1 bg-red-600 text-white font-bold rounded-xl text-xs">
                      Memerlukan Peninjauan BK
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
