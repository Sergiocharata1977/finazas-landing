import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#059669',
};

export const metadata: Metadata = {
  title: 'Don Cándido Finanzas — Gestión de Préstamos Personales',
  description:
    'Plataforma multi-tenant para financieras, cooperativas y mutuales. Automatiza cuotas, cobranzas y contabilidad de tu cartera de préstamos personales.',
  keywords: [
    'préstamos personales',
    'gestión de cartera',
    'financiera',
    'cooperativa',
    'mutual',
    'cuotas',
    'cobranzas',
    'sistema francés',
    'multi-tenant',
    'contabilidad automática',
  ],
  authors: [{ name: 'Don Cándido Finanzas' }],
  creator: 'Don Cándido IA',
  publisher: 'Don Cándido IA',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Don Cándido Finanzas',
    title: 'Don Cándido Finanzas — Préstamos Personales Multi-Tenant',
    description:
      'Gestioná tu cartera de préstamos personales con cuotas automáticas, cobranzas y contabilidad integrada.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Don Cándido Finanzas',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
