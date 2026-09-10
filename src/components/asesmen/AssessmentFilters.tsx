'use client';

import React from 'react';
import { Filter, Calendar, Layers, Users } from 'lucide-react';

interface AssessmentFiltersProps {
  academicYear: string;
  setAcademicYear: (v: string) => void;
  semester: string;
  setSemester: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  classId: string;
  setClassId: (v: string) => void;
  classes: Array<{ id: string; name: string; level: number }>;
}

export default function AssessmentFilters({
  academicYear,
  setAcademicYear,
  semester,
  setSemester,
  level,
  setLevel,
  classId,
  setClassId,
  classes
}: AssessmentFiltersProps) {
  const filteredClasses = level
    ? classes.filter(c => c.level === parseInt(level))
    : classes;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-b pb-2 dark:border-slate-800">
        <Filter className="w-4 h-4 text-blue-600" />
        <span>Filter Data Asesmen Peserta Didik</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Tahun Ajaran */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tahun Ajaran</span>
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="2025/2026">2025/2026 (Aktif)</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Semester</span>
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>
        </div>

        {/* Tingkat Kelas */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Tingkat Kelas</span>
          </label>
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setClassId('');
            }}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="">Semua Tingkat (VII, VIII, IX)</option>
            <option value="7">Tingkat VII</option>
            <option value="8">Tingkat VIII</option>
            <option value="9">Tingkat IX</option>
          </select>
        </div>

        {/* Rombel / Kelas */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Spesifik Kelas</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="">Semua Rombel Kelas</option>
            {filteredClasses.map(c => (
              <option key={c.id} value={c.id}>Kelas {c.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
