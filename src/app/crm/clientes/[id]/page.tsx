'use client';

import { ClientActionTimeline } from '@/components/crm/actions/ClientActionTimeline';
import { CreditoScoringTab } from '@/components/crm/CreditoScoringTab';
import { EntityDetailHeader } from '@/components/design-system/patterns/cards/EntityDetailHeader';
import { KPIStatCard } from '@/components/design-system/patterns/cards/KPIStatCard';
import { ProgressBar } from '@/components/design-system/primitives/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ClienteCRM, TipoCliente } from '@/types/crm';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Receipt,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TIPO_CLIENTE_LABELS: Record<TipoCliente, string> = {
  posible_cliente: 'Posible Cliente',
  cliente_frecuente: 'Cliente Frecuente',
  cliente_antiguo: 'Cliente Antiguo',
};

const TIPO_CLIENTE_COLORS: Record<TipoCliente, 'blue' | 'green' | 'gray'> = {
  posible_cliente: 'blue',
  cliente_frecuente: 'green',
  cliente_antiguo: 'gray',
};

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteCRM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('resumen');
  const [updatingTipoCliente, setUpdatingTipoCliente] = useState(false);

  useEffect(() => {
    const fetchCliente = async () => {
      if (!user?.organization_id) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/crm/clientes/${params.id}?organization_id=${user.organization_id}`
        );
        const data = await res.json();

        if (data.success) {
          setCliente(data.data);
        } else {
          setError(data.error || 'No se encontro el cliente');
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Error al cargar datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [params.id, user?.organization_id]);

  const transitionOptions: Record<TipoCliente, TipoCliente[]> = {
    [TipoCliente.POSIBLE_CLIENTE]: [
      TipoCliente.CLIENTE_FRECUENTE,
      TipoCliente.CLIENTE_ANTIGUO,
    ],
    [TipoCliente.CLIENTE_FRECUENTE]: [TipoCliente.CLIENTE_ANTIGUO],
    [TipoCliente.CLIENTE_ANTIGUO]: [TipoCliente.CLIENTE_FRECUENTE],
  };

  const handleTipoClienteChange = async (nextTipo: TipoCliente) => {
    if (
      !cliente ||
      !user?.organization_id ||
      cliente.tipo_cliente === nextTipo
    ) {
      return;
    }

    try {
      setUpdatingTipoCliente(true);
      const res = await fetch(`/api/crm/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_cliente: nextTipo,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(
          data.error || 'No se pudo actualizar el tipo de cliente'
        );
      }

      setCliente(data.data);
      alert('Tipo de cliente actualizado correctamente');
    } catch (err: any) {
      console.error('Error updating tipo_cliente:', err);
      alert(err.message || 'Error actualizando tipo de cliente');
    } finally {
      setUpdatingTipoCliente(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">
          {error || 'Cliente no encontrado'}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/crm/clientes')}
            className="rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Cuentas corrientes / {cliente.razon_social}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Generar reporte</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Agregar <Plus className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <EntityDetailHeader
        name={cliente.razon_social}
        subtitle={cliente.email}
        tags={[
          {
            label: TIPO_CLIENTE_LABELS[cliente.tipo_cliente],
            color: TIPO_CLIENTE_COLORS[cliente.tipo_cliente],
          },
          {
            label: cliente.isActive ? 'Activa' : 'Inactiva',
            color: cliente.isActive ? 'green' : 'gray',
          },
          ...(cliente.categoria_riesgo
            ? [
                {
                  label: `Riesgo ${cliente.categoria_riesgo}`,
                  color: 'amber' as const,
                },
              ]
            : []),
        ]}
        stats={[
          { label: 'PROYECTO', value: cliente.nombre_comercial || '-' },
          {
            label: 'UNIDADES',
            value: `${cliente.cantidad_compras_12m || 0} compras`,
          },
          {
            label: 'VALOR TOTAL CERRADO',
            value: formatCurrency(cliente.monto_total_compras_historico),
          },
        ]}
        actions={[
          {
            icon: <Receipt className="w-4 h-4" />,
            label: 'Facturas',
            onClick: () => setActiveTab('facturas'),
          },
          {
            icon: <FileText className="w-4 h-4" />,
            label: 'Actividad',
            onClick: () => setActiveTab('actividad'),
          },
          {
            icon: <MoreHorizontal className="w-4 h-4" />,
            label: 'Mas acciones',
            onClick: () => alert('Acciones adicionales en desarrollo'),
          },
        ]}
        tabs={[
          { id: 'resumen', label: 'Resumen' },
          { id: 'credito', label: 'Crédito y Scoring' },
          { id: 'cobranzas', label: 'Cobranzas' },
          { id: 'facturas', label: 'Facturas' },
          { id: 'actividad', label: 'Actividad' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <Card className="rounded-xl border border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Flujo Lead a Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Tipo actual: {TIPO_CLIENTE_LABELS[cliente.tipo_cliente]}
          </p>
          <Select
            value={cliente.tipo_cliente}
            onValueChange={(value: TipoCliente) =>
              handleTipoClienteChange(value)
            }
            disabled={updatingTipoCliente}
          >
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Cambiar tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={cliente.tipo_cliente}>
                {TIPO_CLIENTE_LABELS[cliente.tipo_cliente]} (actual)
              </SelectItem>
              {transitionOptions[cliente.tipo_cliente].map(tipo => (
                <SelectItem key={tipo} value={tipo}>
                  {TIPO_CLIENTE_LABELS[tipo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {activeTab === 'resumen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <KPIStatCard
              label="VALOR CERRADO DEL CLIENTE"
              value={formatCurrency(cliente.monto_total_compras_historico)}
              progress={{
                value: Math.min(
                  100,
                  Math.round(cliente.probabilidad_conversion || 0)
                ),
                label: `PROBABILIDAD ${cliente.probabilidad_conversion || 0}%`,
                color: 'info',
              }}
              subtext={`Alta: ${new Date(cliente.created_at).toLocaleDateString('es-AR')}`}
            />
            <KPIStatCard
              label="CUOTAS / ACTIVIDAD"
              value={`${cliente.cantidad_compras_12m || 0}/12`}
              progress={{
                value: Math.min(
                  100,
                  Math.round((cliente.cantidad_compras_12m || 0) * 8.33)
                ),
                label: `TOTAL 12M ${formatCurrency(cliente.total_compras_12m)}`,
                color: 'success',
              }}
              subtext={
                cliente.proxima_accion?.fecha_programada
                  ? `Proxima accion: ${new Date(cliente.proxima_accion.fecha_programada).toLocaleDateString('es-AR')}`
                  : 'Sin proxima accion programada'
              }
            />
          </div>

          <Card className="rounded-xl border border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Resumen de deudas</CardTitle>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2">Concepto</th>
                      <th className="py-2">Cobrado a la fecha</th>
                      <th className="py-2">Saldo actual</th>
                      <th className="py-2">Deuda final</th>
                      <th className="py-2">Cuotas pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 pr-3">
                        <div className="font-medium">Deuda USD</div>
                        <ProgressBar
                          value={Math.min(
                            100,
                            cliente.probabilidad_conversion || 0
                          )}
                          color="info"
                          size="sm"
                          className="mt-2 max-w-52"
                        />
                      </td>
                      <td>{formatCurrency(cliente.total_compras_12m)}</td>
                      <td>{formatCurrency(cliente.monto_estimado_compra)}</td>
                      <td>
                        {formatCurrency(cliente.monto_total_compras_historico)}
                      </td>
                      <td>
                        {Math.max(0, 12 - (cliente.cantidad_compras_12m || 0))}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-3">
                        <div className="font-medium">
                          Deuda total dolarizada
                        </div>
                        <ProgressBar
                          value={Math.min(
                            100,
                            (cliente.cantidad_compras_12m || 0) * 8.33
                          )}
                          color="warning"
                          size="sm"
                          className="mt-2 max-w-52"
                        />
                      </td>
                      <td>{formatCurrency(cliente.total_compras_12m)}</td>
                      <td>{formatCurrency(cliente.monto_estimado_compra)}</td>
                      <td>
                        {formatCurrency(cliente.monto_total_compras_historico)}
                      </td>
                      <td>
                        {Math.max(0, 24 - (cliente.cantidad_compras_12m || 0))}
                        /24
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'actividad' && (
        <Card className="rounded-xl border border-slate-200 p-4 min-h-[420px]">
          <ClientActionTimeline
            clienteId={cliente.id}
            clienteNombre={cliente.razon_social}
          />
        </Card>
      )}

      {activeTab === 'cobranzas' && (
        <Card className="rounded-xl border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Cobranzas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>CUIT/CUIL: {cliente.cuit_cuil}</p>
            <p>
              Ultima interaccion:{' '}
              {new Date(cliente.ultima_interaccion).toLocaleDateString('es-AR')}
            </p>
            <p>
              Proxima accion:{' '}
              {cliente.proxima_accion?.descripcion || 'No definida'}
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'facturas' && (
        <Card className="rounded-xl border border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Facturas y documentos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {cliente.documentos_adjuntos?.length ? (
              <ul className="space-y-2">
                {cliente.documentos_adjuntos.map((doc, idx) => (
                  <li
                    key={`${doc.nombre}-${idx}`}
                    className="flex items-center justify-between"
                  >
                    <span>{doc.nombre}</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Abrir
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay documentos registrados.</p>
            )}
            <p className="mt-3 text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Actualizado:{' '}
              {new Date(cliente.updated_at).toLocaleDateString('es-AR')}
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'credito' && user?.organization_id && (
        <CreditoScoringTab
          clienteId={cliente.id}
          organizationId={user.organization_id}
          patrimonioNeto={0}
        />
      )}
    </div>
  );
}
