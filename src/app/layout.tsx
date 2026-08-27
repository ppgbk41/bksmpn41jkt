import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaInstallPrompt from '@/components/common/PwaInstallPrompt';

export const metadata: Metadata = {
  title: 'Sistem Pelayanan Bimbingan dan Konseling - SMPN 41 Jakarta',
  description: 'Aplikasi Terintegrasi Pengelolaan Data Peserta Didik, Asesmen, Catatan Konseling Rahasia, Laporan BK, dan Tanggap Darurat Anti-Bullying SMP Negeri 41 Jakarta.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BK SMP 41'
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BK SMP 41" />
      </head>
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
