'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  CalendarCheck,
  Calendar,
  FileText,
  Clock,
  Share2,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  X,
  School,
  Sparkles
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
  highlight?: boolean;
  confidential?: boolean;
}

interface MenuGroup {
  groupTitle: string;
  items: MenuItem[];
}

interface SidebarProps {
  user?: {
    name: string;
    role: string;
    username: string;
  } | null;
  onCloseMobile?: () => void;
}

export default function Sidebar({ user: initialUser, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    } else {
      fetchUserSession();
    }
  }, [initialUser]);

  const fetchUserSession = async () => {
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const currentRole = currentUser?.role;

  // Grouped Menu Architecture with strong typing
  const menuGroups: MenuGroup[] = [
    {
      groupTitle: 'UTAMA & DARURAT',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Portal Siswa', href: '/murid/portal', icon: BookOpen, roles: ['MURID'] },
        { label: '🚨 SOS Bullying', href: '/sos-bullying', icon: ShieldAlert, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'], highlight: true },
      ]
    },
    {
      groupTitle: 'DATA & KESISWAAN',
      items: [
        { label: '🎨 Karya BK Siswa', href: '/karya-bk', icon: Sparkles, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS', 'MURID'] },
        { label: 'Data Peserta Didik', href: '/siswa', icon: Users, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Pengaturan Kelas', href: '/kelas', icon: School, roles: ['ADMIN', 'GURU_BK'] },
        { label: 'Hasil Asesmen', href: '/asesmen', icon: ClipboardCheck, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Asesmen Mandiri', href: '/murid/asesmen', icon: ClipboardCheck, roles: ['MURID'] },
      ]
    },
    {
      groupTitle: 'LAYANAN BIMBINGAN & KONSELING',
      items: [
        { label: 'Daftar Konseling', href: '/layanan/daftar', icon: CalendarCheck, roles: ['MURID', 'ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Jadwal & Kalender', href: '/layanan/konseling', icon: Calendar, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Catatan Sesi Konseling', href: '/catatan-konseling', icon: FileText, roles: ['ADMIN', 'GURU_BK'], confidential: true },
        { label: 'Tindak Lanjut & Kasus', href: '/tindak-lanjut', icon: Clock, roles: ['ADMIN', 'GURU_BK'] },
        { label: 'Rujukan Wali Kelas', href: '/rujukan', icon: Share2, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
      ]
    },
    {
      groupTitle: 'LAPORAN & SISTEM',
      items: [
        { label: 'Laporan & Rekapitulasi', href: '/laporan', icon: BarChart3, roles: ['ADMIN', 'GURU_BK', 'WALI_KELAS'] },
        { label: 'Tahun Ajaran & Kenaikan', href: '/tahun-ajaran', icon: Calendar, roles: ['ADMIN', 'GURU_BK'] },
        { label: 'Manajemen Pengguna', href: '/manajemen-pengguna', icon: UserCog, roles: ['ADMIN'] },
        { label: 'Pengaturan & Audit Log', href: '/pengaturan', icon: Settings, roles: ['ADMIN', 'GURU_BK'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg text-lg">
            BK
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 leading-tight">SMP NEGERI 41</h1>
            <p className="text-xs text-blue-400 font-medium">Pelayanan Terintegrasi</p>
          </div>
        </div>

        {/* Close Button for Mobile Drawer */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info Badge */}
      {currentUser && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-sm border border-blue-500/30">
            {currentUser.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
              {currentUser.role === 'ADMIN'
                ? 'Administrator'
                : currentUser.role === 'GURU_BK'
                ? 'Guru BK'
                : currentUser.role === 'WALI_KELAS'
                ? 'Wali Kelas'
                : 'Peserta Didik'}
            </span>
          </div>
        </div>
      )}

      {/* Grouped Navigation Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {menuGroups.map((group, gIdx) => {
          const visibleItems = currentRole
            ? group.items.filter(item => item.roles.includes(currentRole))
            : [];

          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {/* Group Section Header */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>{group.groupTitle}</span>
              </div>

              {/* Group Items */}
              {visibleItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/murid/portal' && pathname?.startsWith(item.href) && item.href !== '/siswa');

                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                        : item.highlight
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-red-400'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <span className={item.highlight && !isActive ? 'font-bold text-red-400' : ''}>
                        {item.label}
                      </span>
                    </div>

                    {item.confidential && (
                      <span className="flex items-center gap-1 text-[9px] bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded border border-red-800/60 font-bold">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        Rahasia
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
