import { PWARegistrar } from '@/components/pwa/PWARegistrar';
import { RootStructuredData } from '@/components/seo/StructuredData';
import { AuthProvider } from '@/contexts/AuthContext';
import { PostHogProvider } from '@/lib/analytics/posthog-provider';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Viewport configuration (Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#059669',
};

export const metadata: Metadata = {
  title: 'Don Cándido IA - Sistema de Gestión de Calidad ISO 9001',
  description:
    'Don Cándido es tu asistente inteligente para implementar y gestionar tu Sistema de Gestión de Calidad ISO 9001:2015. Automatiza procesos, genera documentos y obtiene tu certificación más rápido.',
  keywords: [
    'ISO 9001',
    'gestión de calidad',
    'SGC',
    'Don Cándido',
    'certificación ISO',
    'calidad',
    'auditoría',
    'mejora continua',
    'sistema de gestión',
  ],
  authors: [{ name: 'Don Cándido IA' }],
  creator: 'Don Cándido IA',
  publisher: 'Don Cándido IA',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/don-candido-favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/don-candido-favicon.png',
  },
  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.doncandidoia.com',
    siteName: 'Don Cándido IA',
    title: 'Don Cándido IA - Sistema ISO 9001 con Inteligencia Artificial',
    description:
      'Implementa tu Sistema de Gestión de Calidad ISO 9001:2015 con la ayuda de Don Cándido, tu asistente de IA especializado en calidad.',
    images: [
      {
        url: 'https://www.doncandidoia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Don Cándido IA - Sistema ISO 9001',
      },
    ],
  },
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Don Cándido IA - Sistema ISO 9001',
    description: 'Asistente inteligente para gestión de calidad ISO 9001:2015',
    images: ['https://www.doncandidoia.com/og-image.png'],
    creator: '@doncandidoia',
  },
  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Don Cándido IA',
  },
  formatDetection: {
    telephone: false,
  },
  // Verification (add your codes when you have them)
  verification: {
    google: 'your-google-verification-code',
  },
  // Canonical and alternates
  alternates: {
    canonical: 'https://www.doncandidoia.com',
    languages: {
      'es-AR': 'https://www.doncandidoia.com',
      es: 'https://www.doncandidoia.com',
    },
  },
  // Category
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PostHogProvider />
        <AuthProvider>{children}</AuthProvider>
        <RootStructuredData />
        <PWARegistrar />
        <Analytics />
      </body>
    </html>
  );
}
