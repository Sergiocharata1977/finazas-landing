// src/app/(dashboard)/vendedor/layout.tsx
// Layout mobile-first para la App Vendedor

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  Download,
  Home,
  MessageSquare,
  RefreshCw,
  Target,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

import { useLocationTracker } from '@/hooks/useLocationTracker';

export default function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useLocationTracker();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    // Detectar estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar actualización de PWA disponible
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Nueva versión disponible
                setUpdateAvailable(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });

      // Escuchar mensajes del SW
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const navItems: NavItem[] = [
    { href: '/app-vendedor', icon: Home, label: 'Inicio' },
    {
      href: '/app-vendedor/acciones',
      icon: Briefcase,
      label: 'Acciones',
    },
    {
      href: '/app-vendedor/whatsapp',
      icon: MessageSquare,
      label: 'WhatsApp',
    },
    { href: '/app-vendedor/clientes', icon: Users, label: 'Clientes' },
    { href: '/app-vendedor/oportunidades', icon: Target, label: 'Opor...' },
    // Mapa and Profile can be accessed from menu or swipe
  ];

  const isActive = (href: string) => {
    if (href === '/app-vendedor') {
      return pathname === '/app-vendedor';
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    // Haptic feedback para mejor UX móvil
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header móvil */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-semibold text-gray-900">Vendedor</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de actualización PWA */}
            {updateAvailable && (
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-md animate-pulse"
                title="Nueva versión disponible"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            )}

            {/* Indicador de conexión */}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                isOnline
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Indicador de sincronización pendiente */}
            {pendingSync > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                <RefreshCw className="w-3 h-3" />
                <span>{pendingSync}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg pb-safe">
        <div className="flex justify-around items-center h-18 max-w-lg mx-auto">
          {navItems.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full relative',
                  'transition-colors duration-200 touch-target',
                  'min-h-[72px]', // 72px = touch target óptimo
                  active ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn('w-6 h-6 mb-1', active && 'stroke-[2.5px]')}
                  />

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-[11px] font-medium',
                    active && 'font-semibold'
                  )}
                >
                  {item.label}
                </span>

                {/* Indicador activo */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
