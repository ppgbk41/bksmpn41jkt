'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.error('PWA Service Worker failed:', err));
    }

    // 2. Check if already installed / running in standalone mode
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(checkStandalone);

    // 3. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay if not dismissed recently
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Untuk memasang di iPhone/iPad (iOS): Ketuk tombol Share (ikon kotak panah ke atas di Safari), lalu pilih "Add to Home Screen" / "Tambah ke Layar Utama".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white border-2 border-blue-500/80 rounded-3xl p-4 shadow-2xl backdrop-blur-xl space-y-3 ring-4 ring-blue-500/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg text-base shrink-0">
              BK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-white">Pasang Aplikasi BK SMPN 41</h4>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-500 text-white">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Akses cepat layar penuh di HP tanpa browser bar & respon darurat SOS Bullying instan.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 p-1"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium"
          >
            Nanti Saja
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/40 transition-transform active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang di HP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
