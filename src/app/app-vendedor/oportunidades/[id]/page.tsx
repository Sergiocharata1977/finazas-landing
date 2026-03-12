// src/app/app-vendedor/oportunidades/[id]/page.tsx
// Página de detalle de oportunidad para vendedor

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { OportunidadCRM } from '@/types/crm-oportunidad';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Edit,
  History,
  Loader2,
  Mail,
  Phone,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OportunidadDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const [oportunidad, setOportunidad] = useState<OportunidadCRM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id || !organizationId) return;

    const loadOportunidad = async () => {
      try {
        const res = await fetch(`/api/crm/oportunidades/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setOportunidad(data.data);
        } else {
          setError(data.error || 'Error al cargar oportunidad');
        }
      } catch (err) {
        console.error('Error loading opportunity:', err);
        setError('Error al cargar oportunidad');
      } finally {
        setLoading(false);
      }
    };

    loadOportunidad();
  }, [params.id, organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !oportunidad) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-600 font-semibold mb-4">
          {error || 'Oportunidad no encontrada'}
        </p>
        <Link href="/app-vendedor/oportunidades">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Oportunidades
          </Button>
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getProbabilidadColor = (prob: number) => {
    if (prob >= 70) return 'text-green-600 bg-green-50';
    if (prob >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 z-30">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/app-vendedor/oportunidades">
              <Button variant="ghost" size="icon" className="touch-target">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {oportunidad.nombre}
              </h1>
              <Badge
                style={{
                  backgroundColor: oportunidad.estado_kanban_color + '20',
                  color: oportunidad.estado_kanban_color,
                  borderColor: oportunidad.estado_kanban_color,
                }}
                variant="outline"
                className="mt-1"
              >
                {oportunidad.estado_kanban_nombre}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Monto Estimado</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(oportunidad.monto_estimado || 0)}
              </p>
            </CardContent>
          </Card>

          <Card className={getProbabilidadColor(oportunidad.probabilidad || 0)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Probabilidad</span>
              </div>
              <p className="text-2xl font-bold">
                {oportunidad.probabilidad || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Descripción */}
        {oportunidad.descripcion && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{oportunidad.descripcion}</p>
            </CardContent>
          </Card>
        )}

        {/* Información de la Organización */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Razón Social</p>
              <p className="font-semibold text-gray-900">
                {oportunidad.organizacion_nombre}
              </p>
            </div>
            {oportunidad.organizacion_cuit && (
              <div>
                <p className="text-sm text-gray-500">CUIT</p>
                <p className="font-medium text-gray-700">
                  {oportunidad.organizacion_cuit}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Contacto */}
        {oportunidad.contacto_nombre && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">
                  {oportunidad.contacto_nombre}
                </p>
              </div>

              {/* Botones de contacto */}
              <div className="flex gap-2 pt-2">
                <a
                  href={`tel:${oportunidad.contacto_nombre}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full touch-target border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                </a>
                <a
                  href={`mailto:${oportunidad.contacto_nombre}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full touch-target border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fechas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Creada</span>
              <span className="font-medium text-gray-700">
                {formatDate(oportunidad.created_at)}
              </span>
            </div>
            {oportunidad.fecha_cierre_estimada && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cierre Estimado</span>
                <span className="font-medium text-gray-700">
                  {formatDate(oportunidad.fecha_cierre_estimada)}
                </span>
              </div>
            )}
            {oportunidad.fecha_cierre_real && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cierre Real</span>
                <span className="font-medium text-gray-700">
                  {formatDate(oportunidad.fecha_cierre_real)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial de Estados */}
        {oportunidad.historial_estados &&
          oportunidad.historial_estados.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-gray-600" />
                  Historial de Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {oportunidad.historial_estados.map((cambio, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {cambio.estado_anterior_nombre} →{' '}
                          {cambio.estado_nuevo_nombre}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(cambio.fecha_cambio)}
                        </p>
                        {cambio.motivo && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            "{cambio.motivo}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Vendedor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vendedor Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-gray-900">
              {oportunidad.vendedor_nombre}
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        {oportunidad.isActive && (
          <div className="space-y-3 pt-2">
            <Button
              className="w-full touch-target bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Próximamente: Editar oportunidad')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Oportunidad
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="touch-target border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => alert('Próximamente: Marcar como ganada')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Ganada
              </Button>
              <Button
                variant="outline"
                className="touch-target border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => alert('Próximamente: Marcar como perdida')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Perdida
              </Button>
            </div>
          </div>
        )}

        {/* Resultado (si está cerrada) */}
        {oportunidad.resultado && (
          <Card
            className={
              oportunidad.resultado === 'ganada'
                ? 'bg-green-50 border-green-200'
                : oportunidad.resultado === 'perdida'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {oportunidad.resultado === 'ganada' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-900">
                  Oportunidad {oportunidad.resultado.toUpperCase()}
                </span>
              </div>
              {oportunidad.motivo_cierre && (
                <p className="text-sm text-gray-700 italic">
                  "{oportunidad.motivo_cierre}"
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
