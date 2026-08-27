'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  Moon,
  Sun,
  ShieldAlert,
  CheckCircle,
  Clock,
  Menu,
  X,
  ArrowRight,
  User,
  School,
  Sparkles,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: any;
  onToggleSidebar?: () => void;
}

export default function Header({ user, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Live Omnisearch State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Click outside listener for search and notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (q: string) => {
    try {
      setSearchLoading(true);
      setShowSearchDropdown(true);
      const res = await fetch(`/api/siswa/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifikasi');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    // 1. Mark as read on server & locally
    try {
      if (!notif.isRead) {
        fetch('/api/notifikasi', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id })
        });
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Close dropdown
    setShowNotifications(false);

    // 3. Resolve destination link
    const isMurid = user?.role === 'MURID';
    let targetLink = notif.link;

    if (!targetLink) {
      if (notif.type === 'SOS_BULLYING' || notif.title?.includes('SOS Bullying')) {
        targetLink = isMurid ? '/murid/portal' : '/sos-bullying';
      } else if (notif.type === 'REGISTRATION' || notif.type === 'SCHEDULE') {
        targetLink = isMurid ? '/murid/portal' : '/layanan/konseling';
      } else if (notif.type === 'REFERRAL') {
        targetLink = '/rujukan';
      } else if (notif.type === 'ASSESSMENT') {
        targetLink = '/asesmen';
      } else {
        targetLink = isMurid ? '/murid/portal' : '/dashboard';
      }
    }

    // 4. Navigate directly
    router.push(targetLink);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifikasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left: Mobile Hamburger & Omnisearch Input */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Omnisearch Bar with Live Predictive Autocomplete */}
        <div className="relative w-56 sm:w-80" ref={searchRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
            }}
            placeholder="Cari nama murid, NIS, atau kelas..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Omnisearch Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                <span>HASIL PENCARIAN CEPAT</span>
                {searchLoading && <span className="text-blue-500">Mencari...</span>}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchLoading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Sedang mencari...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    Tidak ditemukan siswa atau kelas dengan kata kunci "{searchQuery}".
                  </div>
                ) : (
                  searchResults.map((s) => (
                    <Link
                      key={s.id}
                      href={`/siswa/${s.id}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
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

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          Kelas {s.className}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer search hint */}
              <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href={`/siswa?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setShowSearchDropdown(false)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Lihat Semua Hasil di Data Peserta Didik ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Mode Terang / Gelap"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Center Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Pusat Notifikasi Layanan"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifikasi Pelayanan</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {unreadCount} Baru
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                      {notifications.length} Info
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="font-medium">Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUrgent = n.type === 'URGENT' || n.type === 'SOS_BULLYING';

                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                          !n.isRead
                            ? 'bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 dark:hover:bg-blue-900/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isUrgent
                              ? 'bg-red-500/10 text-red-600 dark:bg-red-950 dark:text-red-400'
                              : 'bg-blue-500/10 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {isUrgent ? (
                              <ShieldAlert className="w-4 h-4 animate-pulse" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
                                !n.isRead ? 'text-blue-950 dark:text-blue-200 font-extrabold' : ''
                              }`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {n.message}
                            </p>

                            <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(n.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Buka Halaman <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">
                  Klik notifikasi untuk langsung menuju layanan terkait.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
