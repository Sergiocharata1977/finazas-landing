// src/app/(dashboard)/vendedor/clientes/[id]/page.tsx
// Detalle de cliente con acciones rápidas

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { useAuth } from '@/contexts/AuthContext';
import type { ClienteLocal, VisitaLocal } from '@/types/vendedor';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClienteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const [cliente, setCliente] = useState<ClienteLocal | null>(null);
  const [visitasRecientes, setVisitasRecientes] = useState<VisitaLocal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Cargar desde IndexedDB
    // Mock data
    setCliente({
      id: params.id as string,
      organizationId: organizationId || '',
      razonSocial: 'Agro Norte S.A.',
      cuit: '30-12345678-9',
      direccion: 'Ruta 8 Km 342',
      localidad: 'Pergamino',
      provincia: 'Buenos Aires',
      ubicacion: { lat: -33.9, lng: -60.5 },
      telefono: '+54 11 1234-5678',
      email: 'contacto@agronorte.com',
      vendedorId: '',
      estado: 'activo',
      ultimaVisita: '2024-12-20',
      notas:
        'Cliente importante. Superficie total: 1500 ha. Cultivos principales: soja y maíz.',
      lastSyncAt: new Date().toISOString(),
      version: 1,
    });

    setLoading(false);
  }, [params.id, organizationId]);

  const handleCall = () => {
    if (cliente?.telefono) {
      window.location.href = `tel:${cliente.telefono}`;
    }
  };

  const handleEmail = () => {
    if (cliente?.email) {
      window.location.href = `mailto:${cliente.email}`;
    }
  };

  const handleNavigate = () => {
    if (cliente?.ubicacion) {
      const { lat, lng } = cliente.ubicacion;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        '_blank'
      );
    }
  };

  if (loading || !cliente) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{cliente.razonSocial}</h1>
            <p className="text-white/80 text-sm">CUIT: {cliente.cuit}</p>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="p-4 -mt-4">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex justify-around">
              <button
                onClick={handleCall}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-600">Llamar</span>
              </button>

              <button
                onClick={handleEmail}
                disabled={!cliente.email}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">Email</span>
              </button>

              <button
                onClick={handleNavigate}
                disabled={!cliente.ubicacion}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">Navegar</span>
              </button>

              {/* WhatsApp Button */}
              <div className="flex flex-col items-center gap-1 p-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <WhatsAppButton
                  clienteId={cliente.id}
                  clienteNombre={cliente.razonSocial}
                  telefono={cliente.telefono || ''}
                  variant="ghost"
                  size="sm"
                  className="text-xs p-0 h-auto"
                />
              </div>

              <Link
                href={`/app-vendedor/clientes/${cliente.id}/visita`}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-gray-600">Visita</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información */}
      <div className="px-4 space-y-4">
        {/* Datos de contacto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {cliente.direccion}
                </p>
                <p className="text-sm text-gray-500">
                  {cliente.localidad}, {cliente.provincia}
                </p>
              </div>
            </div>

            {cliente.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-900">{cliente.telefono}</p>
              </div>
            )}

            {cliente.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-900">{cliente.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas */}
        {cliente.notas && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{cliente.notas}</p>
            </CardContent>
          </Card>
        )}

        {/* Última visita */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Historial de Visitas</CardTitle>
              <Link
                href={`/app-vendedor/clientes/${cliente.id}/visitas`}
                className="text-primary text-sm"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cliente.ultimaVisita ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Última visita
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(cliente.ultimaVisita).toLocaleDateString(
                        'es-AR',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay visitas registradas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Botón de nueva visita */}
        <Link href={`/app-vendedor/clientes/${cliente.id}/visita`}>
          <Button className="w-full h-12 text-base gap-2" size="lg">
            <Plus className="w-5 h-5" />
            Registrar Nueva Visita
          </Button>
        </Link>
      </div>
    </div>
  );
}
