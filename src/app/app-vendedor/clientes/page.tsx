// src/app/(dashboard)/vendedor/clientes/page.tsx
// Lista de clientes del vendedor

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import type { ClienteLocal } from '@/types/vendedor';
import {
  Building2,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const [clientes, setClientes] = useState<ClienteLocal[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteLocal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Cargar clientes desde API o IndexedDB
  const cargarClientes = async () => {
    if (!user?.id || !organizationId) return;

    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde API
      const response = await fetch(
        `/api/vendedor/clientes?vendedorId=${user.id}&organizationId=${organizationId}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }

      const data = await response.json();

      if (data.success && data.clientes) {
        setClientes(data.clientes);
        setFilteredClientes(data.clientes);
        setIsOffline(false);

        // Guardar en IndexedDB para uso offline
        // TODO: Implementar guardado en IndexedDB
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setIsOffline(true);

      // Fallback: cargar desde IndexedDB (datos mock por ahora)
      const mockClientes: ClienteLocal[] = [
        {
          id: '1',
          organizationId: organizationId || '',
          razonSocial: 'Agro Norte S.A.',
          cuit: '30-12345678-9',
          direccion: 'Ruta 8 Km 342',
          localidad: 'Pergamino',
          provincia: 'Buenos Aires',
          ubicacion: { lat: -33.9, lng: -60.5 },
          telefono: '+54 11 1234-5678',
          email: 'contacto@agronorte.com',
          vendedorId: user?.id || '',
          estado: 'activo',
          ultimaVisita: '2024-12-20',
          lastSyncAt: new Date().toISOString(),
          version: 1,
        },
        {
          id: '2',
          organizationId: organizationId || '',
          razonSocial: 'Campo Verde SRL',
          cuit: '30-98765432-1',
          direccion: 'Camino Rural s/n',
          localidad: 'Junín',
          provincia: 'Buenos Aires',
          ubicacion: { lat: -34.5, lng: -60.9 },
          telefono: '+54 11 8765-4321',
          vendedorId: user?.id || '',
          estado: 'activo',
          ultimaVisita: '2024-12-18',
          lastSyncAt: new Date().toISOString(),
          version: 1,
        },
        {
          id: '3',
          organizationId: organizationId || '',
          razonSocial: 'Los Alamos Agropecuaria',
          cuit: '20-55667788-9',
          direccion: 'Estancia Los Alamos',
          localidad: 'Rojas',
          provincia: 'Buenos Aires',
          telefono: '+54 11 5566-7788',
          vendedorId: user?.id || '',
          estado: 'prospecto',
          lastSyncAt: new Date().toISOString(),
          version: 1,
        },
      ];

      setClientes(mockClientes);
      setFilteredClientes(mockClientes);
      setError('Modo offline: mostrando datos locales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [user, organizationId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredClientes(
        clientes.filter(
          c =>
            c.razonSocial.toLowerCase().includes(term) ||
            c.localidad.toLowerCase().includes(term) ||
            c.cuit.includes(term)
        )
      );
    }
  }, [searchTerm, clientes]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-700';
      case 'prospecto':
        return 'bg-blue-100 text-blue-700';
      case 'inactivo':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatUltimaVisita = (fecha?: string) => {
    if (!fecha) return 'Sin visitas';
    const date = new Date(fecha);
    const diff = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header con búsqueda */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          {filteredClientes.length} de {clientes.length} clientes
        </p>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-3">
        {filteredClientes.map(cliente => (
          <Link key={cliente.id} href={`/app-vendedor/clientes/${cliente.id}`}>
            <Card className="hover:shadow-md transition-shadow active:scale-[0.99]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {cliente.razonSocial}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEstadoBadge(cliente.estado)}`}
                        >
                          {cliente.estado}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {cliente.localidad}, {cliente.provincia}
                        </p>

                        {cliente.telefono && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cliente.telefono}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Última visita:{' '}
                          {formatUltimaVisita(cliente.ultimaVisita)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredClientes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No se encontraron clientes</p>
            <p className="text-sm">Intenta con otra búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
