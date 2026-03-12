// src/app/(dashboard)/vendedor/page.tsx
// Dashboard principal del Vendedor

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UpdateAppButton } from '@/components/vendedor/UpdateAppButton';
import { WorkModeToggle } from '@/components/vendedor/WorkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Phone,
  Plus,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Stats {
  visitasHoy: number;
  visitasSemana: number;
  clientesAsignados: number;
  pendientesSync: number;
}

interface VisitaReciente {
  id: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  hora: string;
  resultado: string;
}

export default function VendedorDashboard() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const [stats, setStats] = useState<Stats>({
    visitasHoy: 0,
    visitasSemana: 0,
    clientesAsignados: 0,
    pendientesSync: 0,
  });
  const [visitasRecientes, setVisitasRecientes] = useState<VisitaReciente[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar carga real de estadísticas y visitas
    // Por ahora inicializamos vacío
    setStats({
      visitasHoy: 0,
      visitasSemana: 0,
      clientesAsignados: 0,
      pendientesSync: 0,
    });
    setVisitasRecientes([]);
    setLoading(false);
  }, [user, organizationId]);

  const statCards = [
    {
      label: 'Acciones Hoy',
      value: stats.visitasHoy, // TODO: Update naming in internal state later
      icon: Briefcase,
      color: 'bg-blue-500',
      href: '/app-vendedor/acciones',
    },
    {
      label: 'Visitas',
      value: stats.visitasSemana,
      icon: MapPin,
      color: 'bg-green-500',
      href: '/app-vendedor/acciones?tipo=visita',
    },
    {
      label: 'Llamadas/Mails',
      value: 0, // Placeholder
      icon: Phone,
      color: 'bg-purple-500',
      href: '/app-vendedor/acciones?tipo=llamada',
    },
    {
      label: 'Oportunidades',
      value: 0,
      icon: TrendingUp,
      color: 'bg-pink-500',
      href: '/app-vendedor/oportunidades',
    },
  ];

  const getResultadoColor = (resultado: string) => {
    switch (resultado) {
      case 'exitosa':
        return 'text-green-600 bg-green-50';
      case 'reprogramar':
        return 'text-yellow-600 bg-yellow-50';
      case 'sin_contacto':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Hola, {user?.email?.split('@')[0] || 'Vendedor'}!
        </h1>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Modo Trabajo Toggle */}
      <WorkModeToggle />

      {/* Botón de nueva acción */}
      <Link href="/app-vendedor/acciones/nueva">
        <Button className="w-full h-14 text-lg gap-2" size="lg">
          <Plus className="w-5 h-5" />
          Registrar Acción
        </Button>
      </Link>

      {/* Stats Grid - Mayor espaciado */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map(stat => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Acciones Recientes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Últimas Acciones</CardTitle>
            <Link
              href="/app-vendedor/acciones"
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {visitasRecientes.map(visita => (
            <Link
              key={visita.id}
              href={`/app-vendedor/acciones/${visita.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {visita.clienteNombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {visita.fecha} · {visita.hora}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getResultadoColor(visita.resultado)}`}
              >
                {visita.resultado === 'exitosa' && (
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                )}
                {visita.resultado}
              </span>
            </Link>
          ))}

          {visitasRecientes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay acciones recientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximas acciones programadas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Agenda Pendiente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay acciones programadas</p>
            <Link href="/app-vendedor/acciones/nueva">
              <Button variant="outline" size="sm" className="mt-3">
                Agendar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Actualizar App */}
      <UpdateAppButton />
    </div>
  );
}
