// src/app/app-vendedor/mapa/page.tsx
// Mapa de clientes del vendedor con ubicación GPS

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { ClienteLocal } from '@/types/vendedor';
import {
  ChevronRight,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Ubicacion {
  lat: number;
  lng: number;
  accuracy: number;
}

export default function MapaPage() {
  const { user } = useAuth();
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);

  // Obtener ubicación GPS
  const obtenerUbicacion = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Tu dispositivo no soporta geolocalización');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setUbicacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      err => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              'Permiso de ubicación denegado. Actívalo en configuración.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible');
            break;
          case err.TIMEOUT:
            setError('Tiempo de espera agotado');
            break;
          default:
            setError('Error al obtener ubicación');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Cargar clientes de ejemplo
  useEffect(() => {
    // TODO: Cargar desde IndexedDB o API
    const mockClientes: ClienteLocal[] = [
      {
        id: '1',
        organizationId: user?.organization_id || '',
        razonSocial: 'Agro Norte S.A.',
        cuit: '30-12345678-9',
        direccion: 'Ruta 8 Km 342',
        localidad: 'Pergamino',
        provincia: 'Buenos Aires',
        ubicacion: { lat: -33.9, lng: -60.5 },
        telefono: '+54 11 1234-5678',
        vendedorId: user?.id || '',
        estado: 'activo',
        ultimaVisita: '2024-12-20',
        lastSyncAt: new Date().toISOString(),
        version: 1,
      },
      {
        id: '2',
        organizationId: user?.organization_id || '',
        razonSocial: 'Campo Verde SRL',
        cuit: '30-98765432-1',
        direccion: 'Camino Rural s/n',
        localidad: 'Junín',
        provincia: 'Buenos Aires',
        ubicacion: { lat: -34.5, lng: -60.9 },
        vendedorId: user?.id || '',
        estado: 'activo',
        ultimaVisita: '2024-12-18',
        lastSyncAt: new Date().toISOString(),
        version: 1,
      },
      {
        id: '3',
        organizationId: user?.organization_id || '',
        razonSocial: 'Los Alamos Agropecuaria',
        cuit: '20-55667788-9',
        direccion: 'Estancia Los Alamos',
        localidad: 'Rojas',
        provincia: 'Buenos Aires',
        ubicacion: { lat: -34.2, lng: -60.7 },
        vendedorId: user?.id || '',
        estado: 'prospecto',
        lastSyncAt: new Date().toISOString(),
        version: 1,
      },
    ];
    setClientes(mockClientes);
  }, [user]);

  // Obtener ubicación al cargar
  useEffect(() => {
    obtenerUbicacion();
  }, []);

  // Calcular distancia aproximada (Haversine simplificado)
  const calcularDistancia = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Ordenar clientes por distancia
  const clientesOrdenados = ubicacion
    ? [...clientes]
        .filter(c => c.ubicacion)
        .map(c => ({
          ...c,
          distancia: calcularDistancia(
            ubicacion.lat,
            ubicacion.lng,
            c.ubicacion!.lat,
            c.ubicacion!.lng
          ),
        }))
        .sort((a, b) => a.distancia - b.distancia)
    : clientes.map(c => ({ ...c, distancia: 0 }));

  // Abrir en Google Maps
  const abrirEnMaps = (cliente: ClienteLocal) => {
    if (cliente.ubicacion) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${cliente.ubicacion.lat},${cliente.ubicacion.lng}`;
      window.open(url, '_blank');
    } else if (cliente.direccion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.direccion + ', ' + cliente.localidad)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header con ubicación */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium">Tu ubicación</p>
                {loading ? (
                  <p className="text-sm text-emerald-100 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Obteniendo...
                  </p>
                ) : error ? (
                  <p className="text-sm text-red-200">{error}</p>
                ) : ubicacion ? (
                  <p className="text-sm text-emerald-100">
                    ±{ubicacion.accuracy.toFixed(0)}m de precisión
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={obtenerUbicacion}
              disabled={loading}
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mapa embed (OpenStreetMap) */}
      {ubicacion && (
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <iframe
              title="Mapa de ubicación"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${ubicacion.lng - 0.05}%2C${ubicacion.lat - 0.05}%2C${ubicacion.lng + 0.05}%2C${ubicacion.lat + 0.05}&layer=mapnik&marker=${ubicacion.lat}%2C${ubicacion.lng}`}
              style={{ border: 0 }}
            />
            <a
              href={`https://www.google.com/maps?q=${ubicacion.lat},${ubicacion.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 bg-white rounded-lg px-3 py-1.5 text-xs font-medium shadow-md flex items-center gap-1 text-gray-700"
            >
              <Navigation className="w-3 h-3" />
              Abrir en Google Maps
            </a>
          </div>
        </Card>
      )}

      {/* Lista de clientes cercanos */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">
          Clientes {ubicacion ? 'cercanos' : ''}
        </h2>
        <div className="space-y-3">
          {clientesOrdenados.map(cliente => (
            <Card
              key={cliente.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {cliente.razonSocial}
                      </h3>
                      {cliente.distancia > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
                          {cliente.distancia < 1
                            ? `${(cliente.distancia * 1000).toFixed(0)}m`
                            : `${cliente.distancia.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {cliente.localidad}, {cliente.provincia}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => abrirEnMaps(cliente)}
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                    <Link href={`/app-vendedor/clientes/${cliente.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {clientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No tienes clientes asignados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
