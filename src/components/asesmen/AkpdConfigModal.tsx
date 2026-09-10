'use client';

import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, AlertTriangle, CheckCircle, X, Save } from 'lucide-react';

interface AkpdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AkpdConfigModal({ isOpen, onClose }: AkpdConfigModalProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Pribadi');
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/asesmen/config');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeverityChange = async (itemCode: string, newSeverity: string, statement: string, category: string) => {
    try {
      setUpdatingCode(itemCode);
      const res = await fetch('/api/asesmen/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode, severity: newSeverity, statement, category })
      });

      if (res.ok) {
        setItems(prev => prev.map(i => i.id === itemCode ? { ...i, severity: newSeverity } : i));
      } else {
        alert('Gagal menyimpan konfigurasi');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setUpdatingCode(null);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Pengaturan Severity Butir AKPD (Assessment Alert Config)
              </h3>
              <p className="text-[11px] text-slate-400">
                Konfigurasi tingkatan indikator kebutuhan agar critical item dapat memicu alert otomatis bagi Guru BK.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b dark:border-slate-800 pb-2">
          {['Pribadi', 'Sosial', 'Belajar', 'Karier'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Bidang {cat}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Memuat data butir AKPD...</div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">[{item.id}]</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Bidang {item.category}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={updatingCode === item.id}
                    onClick={() => handleSeverityChange(item.id, 'NORMAL', item.text, item.category)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      item.severity === 'NORMAL'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300'
                    }`}
                  >
                    Normal
                  </button>

                  <button
                    disabled={updatingCode === item.id}
                    onClick={() => handleSeverityChange(item.id, 'ATTENTION', item.text, item.category)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      item.severity === 'ATTENTION'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-amber-600 border-amber-300'
                    }`}
                  >
                    Attention
                  </button>

                  <button
                    disabled={updatingCode === item.id}
                    onClick={() => handleSeverityChange(item.id, 'CRITICAL', item.text, item.category)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                      item.severity === 'CRITICAL'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-red-600 border-red-300'
                    }`}
                  >
                    Critical
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 flex justify-end border-t dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
