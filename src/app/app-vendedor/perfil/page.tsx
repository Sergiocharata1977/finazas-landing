// src/app/(dashboard)/vendedor/perfil/page.tsx
// Página de perfil y configuración del vendedor

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  Bell,
  BellOff,
  ChevronRight,
  HelpCircle,
  Image,
  Info,
  Loader2,
  LogOut,
  Settings,
  User,
  Wifi,
} from 'lucide-react';
import { useState } from 'react';

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [syncOnlyWifi, setSyncOnlyWifi] = useState(false);
  const [compresionAlta, setCompresionAlta] = useState(true);

  // Hook de push notifications
  const {
    isSupported,
    permission,
    isSubscribed,
    loading: pushLoading,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  } = usePushNotifications();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Toggle component simple
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Perfil del usuario */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-900">
                {user?.email?.split('@')[0] || 'Vendedor'}
              </p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de sincronización */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Solo con Wi-Fi</p>
                <p className="text-xs text-gray-500">
                  Evita usar datos móviles
                </p>
              </div>
            </div>
            <Toggle checked={syncOnlyWifi} onChange={setSyncOnlyWifi} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Compresión alta de fotos</p>
                <p className="text-xs text-gray-500">
                  Reduce tamaño para sincronizar más rápido
                </p>
              </div>
            </div>
            <Toggle checked={compresionAlta} onChange={setCompresionAlta} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSubscribed ? (
                <Bell className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium">Notificaciones Push</p>
                <p className="text-xs text-gray-500">
                  {!isSupported
                    ? 'No soportado en este dispositivo'
                    : permission === 'denied'
                      ? 'Bloqueadas en configuración'
                      : isSubscribed
                        ? 'Activadas'
                        : 'Desactivadas'}
                </p>
              </div>
            </div>
            {isSupported &&
              permission !== 'denied' &&
              (pushLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <Toggle
                  checked={isSubscribed}
                  onChange={() => (isSubscribed ? unsubscribe() : subscribe())}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Otros enlaces */}
      <Card>
        <CardContent className="p-0">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Ayuda</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Acerca de</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      {/* Versión */}
      <p className="text-center text-xs text-gray-400">
        App Vendedor v1.0.0 • Don Cándido CRM
      </p>

      {/* Cerrar sesión */}
      <Button
        variant="outline"
        className="w-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar sesión
      </Button>
    </div>
  );
}
