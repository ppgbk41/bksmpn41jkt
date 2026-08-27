'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Check, X, ChevronDown, GraduationCap, Sparkles } from 'lucide-react';

export interface StudentOption {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: string;
  className: string;
  classLevel?: number;
  phone?: string;
}

interface StudentSelectProps {
  value: string; // studentId
  onChange: (studentId: string, student?: StudentOption) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  classNameFilter?: string; // Optional pre-locked class
}

export default function StudentSelect({
  value,
  onChange,
  label = 'Pilih Peserta Didik *',
  required = false,
  disabled = false,
  placeholder = 'Cari nama siswa, NIS, atau kelas (misal 7A)...',
  classNameFilter
}: StudentSelectProps) {
  const [query, setQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(classNameFilter || 'ALL');
  const [results, setResults] = useState<StudentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const availableClasses = [
    'ALL',
    '7A', '7B', '7C', '7D', '7E', '7F', '7G',
    '8A', '8B', '8C', '8D', '8E', '8F', '8G',
    '9A', '9B', '9C', '9D', '9E', '9F', '9G'
  ];

  // Fetch initial student if value exists
  useEffect(() => {
    if (value) {
      fetchStudentById(value);
    } else {
      setSelectedStudent(null);
    }
  }, [value]);

  // Fetch results when query or selectedClass changes
  useEffect(() => {
    if (isOpen) {
      searchStudents();
    }
  }, [query, selectedClass, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudentById = async (id: string) => {
    try {
      const res = await fetch(`/api/siswa/search?q=${id}`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.students || []).find((s: StudentOption) => s.id === id);
        if (found) {
          setSelectedStudent(found);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const searchStudents = async () => {
    try {
      setLoading(true);
      let url = `/api/siswa/search?q=${encodeURIComponent(query)}`;
      if (selectedClass !== 'ALL') {
        url += `&className=${selectedClass}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setResults(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (student: StudentOption) => {
    setSelectedStudent(student);
    onChange(student.id, student);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(null);
    onChange('', undefined);
    setQuery('');
  };

  return (
    <div className="space-y-1.5 text-xs" ref={containerRef}>
      {label && (
        <label className="block font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Selected Student Card Display */}
      {selectedStudent ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/30">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedStudent.name}
                </span>
                <span className="px-2 py-0.5 bg-blue-600 text-white font-extrabold text-[10px] rounded-md">
                  Kelas {selectedStudent.className}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  ({selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                NIS: <b>{selectedStudent.nis}</b> • NISN: {selectedStudent.nisn}
              </p>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Ganti Peserta Didik"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Search Box & Trigger */
        <div className="relative">
          <div
            onClick={() => {
              if (!disabled) setIsOpen(true);
            }}
            className={`w-full p-2.5 bg-white dark:bg-slate-800 border rounded-2xl flex items-center gap-2 cursor-pointer transition-all ${
              isOpen
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs"
            />
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Autocomplete Results Popover Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
              {/* Quick Class Filter Bar inside dropdown */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 shrink-0 mr-1">Filter Kelas:</span>
                {['ALL', '7A', '7B', '7C', '7D', '8A', '8B', '8C', '9A', '9B', '9C'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedClass(c)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                      selectedClass === c
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'ALL' ? 'Semua' : c}
                  </button>
                ))}
              </div>

              {/* Student Results List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <div className="p-4 text-center text-slate-400">Mencari data siswa...</div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    Tidak ditemukan siswa dengan kata kunci "{query}".
                  </div>
                ) : (
                  results.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelect(s)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            NIS: {s.nis} • NISN: {s.nisn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {s.className}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {s.gender === 'L' ? 'L' : 'P'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
