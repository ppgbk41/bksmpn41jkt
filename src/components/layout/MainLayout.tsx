'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldAlert,
  Menu,
  BookOpen,
  CalendarCheck
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function MainLayout({ children, user: initialUser }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const pathname = usePathname();

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    } else {
      fetchSession();
    }
  }, [initialUser]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isMurid = currentUser?.role === 'MURID';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar for Desktop & Mobile Slide Drawer */}
      <div
        className={`fixed lg:sticky top-0 z-50 lg:z-30 h-screen transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar user={currentUser} onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header user={currentUser} onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <main className="flex-1 p-3.5 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock (Optimasi UI Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-30 flex items-center justify-around px-2 shadow-2xl">
        {/* Nav 1: Dashboard / Portal */}
        <Link
          href={isMurid ? '/murid/portal' : '/dashboard'}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            (pathname === '/dashboard' || pathname === '/murid/portal')
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isMurid ? <BookOpen className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
          <span className="text-[9px] mt-0.5">{isMurid ? 'Portal' : 'Beranda'}</span>
        </Link>

        {/* Nav 2: Siswa / Daftar */}
        <Link
          href={isMurid ? '/layanan/daftar' : '/siswa'}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            (pathname?.startsWith('/siswa') || pathname === '/layanan/daftar')
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isMurid ? <CalendarCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          <span className="text-[9px] mt-0.5">{isMurid ? 'Daftar' : 'Siswa'}</span>
        </Link>

        {/* Nav Center: Floating SOS Bullying Panic Button */}
        <Link
          href={isMurid ? '/murid/portal' : '/sos-bullying'}
          className="flex flex-col items-center justify-center -mt-6 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 ring-4 ring-slate-950 animate-bounce group-hover:scale-110 transition-all">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-extrabold text-red-400 mt-1">SOS</span>
        </Link>

        {/* Nav 4: Konseling / Jadwal */}
        <Link
          href={isMurid ? '/layanan/daftar' : '/layanan/konseling'}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            (pathname?.startsWith('/layanan') && pathname !== '/layanan/daftar')
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">{isMurid ? 'Layanan' : 'Jadwal'}</span>
        </Link>

        {/* Nav 5: Menu Drawer Trigger */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-14 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Menu</span>
        </button>
      </div>
    </div>
  );
}
