// src/app/(dashboard)/vendedor/sync/page.tsx
// Página de estado de sincronización

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/vendedor/db';
import { syncEngine } from '@/lib/vendedor/syncEngine';
import type { SyncQueueItem } from '@/types/vendedor';
import {
  AlertCircle,
  FileText,
  Image,
  Loader2,
  Mic,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SyncStats {
  visitasPendientes: number;
  fotosPendientes: number;
  audiosPendientes: number;
  errores: number;
}

export default function SyncPage() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<SyncStats>({
    visitasPendientes: 0,
    fotosPendientes: 0,
    audiosPendientes: 0,
    errores: 0,
  });
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Suscribirse a eventos de sincronización
    const unsubscribe = syncEngine.subscribe(event => {
      if (event.type === 'start') setIsSyncing(true);
      if (event.type === 'complete' || event.type === 'error') {
        setIsSyncing(false);
        loadStats();
      }
    });

    loadStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    if (!organizationId) return;

    try {
      const queueItems = await db.getSyncQueue(organizationId);
      setQueue(queueItems);

      const visitasPendientes = queueItems.filter(
        i => i.tipo === 'visita'
      ).length;
      const fotosPendientes = queueItems.filter(i => i.tipo === 'foto').length;
      const audiosPendientes = queueItems.filter(
        i => i.tipo === 'audio'
      ).length;
      const errores = queueItems.filter(
        i => i.intentos >= i.maxIntentos
      ).length;

      setStats({
        visitasPendientes,
        fotosPendientes,
        audiosPendientes,
        errores,
      });
    } catch (error) {
      console.error('Error loading sync stats:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await syncEngine.forceSync();
      setLastSync(new Date().toLocaleTimeString('es-AR'));
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
      loadStats();
    }
  };

  const handleClearErrors = async () => {
    // TODO: Implementar limpieza de errores
  };

  const totalPendiente =
    stats.visitasPendientes + stats.fotosPendientes + stats.audiosPendientes;

  return (
    <div className="p-4 space-y-4">
      {/* Estado de conexión */}
      <Card
        className={
          isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-red-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {isOnline ? 'Conectado' : 'Sin conexión'}
                </p>
                <p className="text-sm text-gray-500">
                  {isOnline
                    ? 'Los datos se sincronizarán automáticamente'
                    : 'Los datos se guardan localmente'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de pendientes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pendientes de sincronizar</CardTitle>
            <span className="text-2xl font-bold text-primary">
              {totalPendiente}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Visitas</span>
            </div>
            <span className="font-semibold">{stats.visitasPendientes}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-green-500" />
              <span className="text-sm">Fotos</span>
            </div>
            <span className="font-semibold">{stats.fotosPendientes}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Audios</span>
            </div>
            <span className="font-semibold">{stats.audiosPendientes}</span>
          </div>

          {stats.errores > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">Con errores</span>
              </div>
              <span className="font-semibold text-red-700">
                {stats.errores}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón de sincronización */}
      <Button
        className="w-full h-14 text-lg gap-2"
        size="lg"
        onClick={handleSync}
        disabled={!isOnline || isSyncing || totalPendiente === 0}
      >
        {isSyncing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5" />
            Sincronizar ahora
          </>
        )}
      </Button>

      {lastSync && (
        <p className="text-center text-sm text-gray-500">
          Última sincronización: {lastSync}
        </p>
      )}

      {/* Información de almacenamiento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Almacenamiento local</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Datos guardados</span>
              <span className="font-medium">{totalPendiente} items</span>
            </div>
            <p className="text-xs text-gray-400">
              Los datos se mantienen seguros en tu dispositivo hasta que se
              sincronicen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Acciones adicionales */}
      {stats.errores > 0 && (
        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Algunos elementos no se pudieron sincronizar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Esto puede deberse a problemas de conexión. Los datos están
                  seguros localmente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleSync}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
