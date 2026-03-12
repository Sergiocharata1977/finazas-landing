'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Columns, LayoutList, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  SolicitudCommercialReference,
  Solicitud,
  SolicitudEstado,
  SolicitudTipo,
} from '@/types/solicitudes';

type OperationalFlow = Extract<SolicitudTipo, 'repuesto' | 'servicio'>;
type ViewMode = 'lista' | 'kanban';

const CRM_SYNC_LABEL: Record<string, string> = {
  pending: 'Pendiente de CRM',
  synced: 'En CRM',
  error: 'Error de sync',
  not_applicable: 'No aplica',
};

const FLOW_CONFIG: Record<
  OperationalFlow,
  {
    label: string;
    pluralLabel: string;
    badgeClass: string;
    emptyLabel: string;
    description: string;
  }
> = {
  repuesto: {
    label: 'Repuestos',
    pluralLabel: 'solicitudes de repuestos',
    badgeClass: 'bg-blue-100 text-blue-700',
    emptyLabel: 'Sin solicitudes de repuestos',
    description:
      'Tablero operativo para cotizar, revisar y cerrar pedidos de repuestos.',
  },
  servicio: {
    label: 'Servicios',
    pluralLabel: 'solicitudes de servicios',
    badgeClass: 'bg-amber-100 text-amber-700',
    emptyLabel: 'Sin solicitudes de servicios',
    description:
      'Tablero operativo para coordinar diagnosticos, visitas tecnicas y cierres de servicio.',
  },
};

const ESTADOS_LIST: Array<{ value: SolicitudEstado; label: string }> = [
  { value: 'recibida', label: 'Recibida' },
  { value: 'en_revision', label: 'En revision' },
  { value: 'gestionando', label: 'Gestionando' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'cancelada', label: 'Cancelada' },
];

const KANBAN_COLUMNAS: Array<{
  estado: SolicitudEstado;
  label: string;
  headerClass: string;
  dotClass: string;
}> = [
  {
    estado: 'recibida',
    label: 'Recibida',
    headerClass: 'bg-slate-100 border-slate-300',
    dotClass: 'bg-slate-400',
  },
  {
    estado: 'en_revision',
    label: 'En Revision',
    headerClass: 'bg-blue-100 border-blue-300',
    dotClass: 'bg-blue-500',
  },
  {
    estado: 'gestionando',
    label: 'Gestionando',
    headerClass: 'bg-amber-100 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  {
    estado: 'cerrada',
    label: 'Cerrada',
    headerClass: 'bg-emerald-100 border-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  {
    estado: 'cancelada',
    label: 'Cancelada',
    headerClass: 'bg-rose-100 border-rose-300',
    dotClass: 'bg-rose-400',
  },
];

function PayloadDetail({ solicitud }: { solicitud: Solicitud }) {
  const payload = solicitud.payload;
  const row = (label: string, value: unknown) =>
    value != null && value !== '' ? (
      <div key={label}>
        <span className="font-medium text-slate-900">{label}:</span>{' '}
        <span className="text-slate-700">{String(value)}</span>
      </div>
    ) : null;

  if (solicitud.tipo === 'repuesto') {
    return (
      <div className="grid gap-2 text-sm">
        {row('Maquina', payload.maquina_tipo)}
        {row('Modelo', payload.modelo)}
        {row('Nro. de serie', payload.numero_serie)}
        {!!payload.descripcion_repuesto && (
          <div>
            <span className="font-medium text-slate-900">
              Repuesto solicitado:
            </span>
            <p className="mt-1 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {String(payload.descripcion_repuesto)}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (solicitud.tipo === 'servicio') {
    return (
      <div className="grid gap-2 text-sm">
        {row('Maquina', payload.maquina_tipo)}
        {row('Modelo', payload.modelo)}
        {row('Nro. de serie', payload.numero_serie)}
        {row('Localidad', payload.localidad)}
        {row('Provincia', payload.provincia)}
        {!!payload.descripcion_problema && (
          <div>
            <span className="font-medium text-slate-900">
              Problema tecnico:
            </span>
            <p className="mt-1 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {String(payload.descripcion_problema)}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <pre className="max-h-48 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

function KanbanCard({
  solicitud,
  selected,
  onClick,
}: {
  solicitud: Solicitud;
  selected: boolean;
  onClick: () => void;
}) {
  const flowConfig = FLOW_CONFIG[solicitud.tipo as OperationalFlow];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
        selected
          ? 'border-emerald-400 bg-emerald-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {solicitud.numero}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${flowConfig.badgeClass}`}
        >
          {flowConfig.label}
        </span>
      </div>
      <p className="mb-1 text-sm font-medium leading-snug text-slate-900">
        {solicitud.nombre}
      </p>
      {(solicitud.telefono ?? solicitud.email) && (
        <p className="truncate text-xs text-slate-500">
          {solicitud.telefono ?? solicitud.email}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        {new Date(solicitud.created_at).toLocaleDateString('es-AR')}
      </p>
    </button>
  );
}

function DetailPanel({
  solicitud,
  saving,
  assignmentDraft,
  onAssignmentChange,
  onEstadoChange,
  onSaveAssignment,
}: {
  solicitud: Solicitud | null;
  saving: string | null;
  assignmentDraft: string;
  onAssignmentChange: (value: string) => void;
  onEstadoChange: (estado: SolicitudEstado) => void;
  onSaveAssignment: () => void;
}) {
  if (!solicitud) {
    return (
      <div className="flex min-h-[320px] h-full items-center justify-center text-center text-sm text-slate-500">
        Selecciona una solicitud del flujo visible para ver el detalle y editar su estado.
      </div>
    );
  }

  const flowConfig = FLOW_CONFIG[solicitud.tipo as OperationalFlow];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Detalle operativo
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          {solicitud.numero}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {flowConfig.label} - {solicitud.nombre}
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <div>
          <span className="font-medium text-slate-900">Telefono:</span>{' '}
          {solicitud.telefono || 'No informado'}
        </div>
        <div>
          <span className="font-medium text-slate-900">Email:</span>{' '}
          {solicitud.email || 'No informado'}
        </div>
        <div>
          <span className="font-medium text-slate-900">CUIT:</span>{' '}
          {solicitud.cuit || 'No informado'}
        </div>
        <div>
          <span className="font-medium text-slate-900">Origen:</span>{' '}
          {solicitud.origen}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Estado del flujo
        </label>
        <Select value={solicitud.estado} onValueChange={value => onEstadoChange(value as SolicitudEstado)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_LIST.map(estado => (
              <SelectItem key={estado.value} value={estado.value}>
                {estado.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Asignado a
        </label>
        <div className="flex gap-2">
          <input
            value={assignmentDraft}
            onChange={event => onAssignmentChange(event.target.value)}
            placeholder="UID o referencia simple"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
          />
          <Button
            onClick={onSaveAssignment}
            disabled={saving === solicitud.id}
          >
            Guardar
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Mensaje</p>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {solicitud.mensaje || 'Sin mensaje adicional'}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Detalle de solicitud
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <PayloadDetail solicitud={solicitud} />
        </div>
      </div>
    </div>
  );
}

function FlowSwitcher({
  value,
  onChange,
}: {
  value: OperationalFlow;
  onChange: (value: OperationalFlow) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {(Object.entries(FLOW_CONFIG) as Array<[OperationalFlow, (typeof FLOW_CONFIG)[OperationalFlow]]>).map(
        ([flow, config]) => (
          <button
            key={flow}
            type="button"
            onClick={() => onChange(flow)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              value === flow
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {config.label}
          </button>
        )
      )}
    </div>
  );
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [commercialReferences, setCommercialReferences] = useState<
    SolicitudCommercialReference[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<OperationalFlow>('repuesto');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assignmentDraft, setAssignmentDraft] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const flowConfig = FLOW_CONFIG[selectedFlow];

  const selectedSolicitud = useMemo(
    () => solicitudes.find(solicitud => solicitud.id === selectedId) || null,
    [selectedId, solicitudes]
  );

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ tipo: selectedFlow });
      params.set('includeCommercialReferences', 'true');
      if (viewMode === 'lista' && selectedEstado !== 'all') {
        params.set('estado', selectedEstado);
      }

      const response = await fetch(`/api/solicitudes?${params.toString()}`, {
        cache: 'no-store',
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'No se pudieron obtener las solicitudes');
      }

      setSolicitudes(json.data || []);
      setCommercialReferences(json.commercialReferences || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar solicitudes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSolicitudes();
  }, [selectedFlow, selectedEstado, viewMode]);

  useEffect(() => {
    if (selectedId && !solicitudes.some(item => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, solicitudes]);

  useEffect(() => {
    setAssignmentDraft(selectedSolicitud?.assigned_to || '');
  }, [selectedSolicitud]);

  const updateSolicitud = async (
    id: string,
    payload: Record<string, unknown>
  ) => {
    try {
      setSaving(id);
      const response = await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'No se pudo actualizar la solicitud');
      }

      setSolicitudes(prev =>
        prev.map(item => (item.id === id ? json.data : item))
      );
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la solicitud';
      setError(message);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
                  Dealer
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                  Solicitudes operativas
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Dos tableros separados para operar repuestos y servicios. Las solicitudes comerciales se siguen desde CRM / Oportunidades.
                </p>
              </div>

              <FlowSwitcher
                value={selectedFlow}
                onChange={flow => {
                  setSelectedFlow(flow);
                  setSelectedId(null);
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {viewMode === 'lista' && (
                <div className="w-44">
                  <Select
                    value={selectedEstado}
                    onValueChange={setSelectedEstado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {ESTADOS_LIST.map(estado => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button variant="outline" onClick={() => void loadSolicitudes()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Actualizar
              </Button>

              <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('lista')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    viewMode === 'lista'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Columns className="h-4 w-4" />
                  Kanban
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${flowConfig.badgeClass}`}
                  >
                    {flowConfig.label}
                  </span>
                  <span className="text-sm text-slate-500">
                    {loading ? 'Cargando...' : `${solicitudes.length} ${flowConfig.pluralLabel}`}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm text-slate-600">
                  {flowConfig.description}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                El Kanban comercial vive en CRM / Oportunidades.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Referencia comercial
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Las solicitudes comerciales se derivan a
              {' '}
              <Link
                href="/crm"
                className="font-medium text-emerald-700 hover:text-emerald-800"
              >
                CRM / Oportunidades
              </Link>
              . Este panel mantiene solo trazabilidad de origen.
            </p>
            <div className="mt-4 space-y-3">
              {commercialReferences.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No hay solicitudes comerciales recientes.
                </div>
              ) : (
                commercialReferences.map(reference => (
                  <div
                    key={reference.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {reference.numero}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {reference.nombre}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                        {CRM_SYNC_LABEL[reference.crm_sync_status || 'pending'] ||
                          'Pendiente'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(reference.created_at).toLocaleString('es-AR')}
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      {reference.crm_oportunidad_id
                        ? `Oportunidad CRM: ${reference.crm_oportunidad_id}`
                        : 'Sin oportunidad CRM asociada todavia.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {viewMode === 'lista' && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4 text-sm text-slate-500">
                {loading
                  ? `Cargando ${flowConfig.pluralLabel}...`
                  : `${solicitudes.length} ${flowConfig.pluralLabel}`}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Numero</th>
                      <th className="px-4 py-3">Flujo</th>
                      <th className="px-4 py-3">Contacto</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {solicitudes.map(solicitud => (
                      <tr
                        key={solicitud.id}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          solicitud.id === selectedId
                            ? 'bg-emerald-50/70'
                            : 'bg-white'
                        }`}
                        onClick={() => setSelectedId(solicitud.id)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {solicitud.numero}
                          </div>
                          <div className="text-xs text-slate-500">
                            {solicitud.organization_id}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {flowConfig.label}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800">
                            {solicitud.nombre}
                          </div>
                          <div className="text-xs text-slate-500">
                            {solicitud.telefono ||
                              solicitud.email ||
                              'Sin dato'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {solicitud.estado}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Date(solicitud.created_at).toLocaleString(
                            'es-AR'
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loading && solicitudes.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No hay solicitudes para los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <DetailPanel
                solicitud={selectedSolicitud}
                saving={saving}
                assignmentDraft={assignmentDraft}
                onAssignmentChange={setAssignmentDraft}
                onEstadoChange={value => {
                  if (!selectedSolicitud) return;
                  void updateSolicitud(selectedSolicitud.id, { estado: value });
                }}
                onSaveAssignment={() => {
                  if (!selectedSolicitud) return;
                  void updateSolicitud(selectedSolicitud.id, {
                    assigned_to: assignmentDraft.trim() || null,
                  });
                }}
              />
            </div>
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="flex gap-6">
            <div className="min-w-0 flex-1 overflow-x-auto">
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                  {`Cargando ${flowConfig.pluralLabel}...`}
                </div>
              ) : (
                <div
                  className="flex gap-4 pb-4"
                  style={{ minWidth: `${KANBAN_COLUMNAS.length * 272}px` }}
                >
                  {KANBAN_COLUMNAS.map(columna => {
                    const items = solicitudes.filter(
                      solicitud => solicitud.estado === columna.estado
                    );
                    return (
                      <div key={columna.estado} className="w-64 flex-shrink-0">
                        <div
                          className={`${columna.headerClass} rounded-t-xl border px-4 py-3`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full ${columna.dotClass}`}
                              />
                              <span className="text-sm font-semibold text-slate-800">
                                {columna.label}
                              </span>
                            </div>
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {items.length}
                            </span>
                          </div>
                        </div>

                        <div className="min-h-[500px] space-y-3 rounded-b-xl border border-t-0 border-slate-200 bg-slate-50 p-3">
                          {items.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-400">
                              {flowConfig.emptyLabel}
                            </p>
                          ) : (
                            items.map(solicitud => (
                              <KanbanCard
                                key={solicitud.id}
                                solicitud={solicitud}
                                selected={solicitud.id === selectedId}
                                onClick={() => setSelectedId(solicitud.id)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedSolicitud && (
              <div className="sticky top-6 w-80 flex-shrink-0 self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <DetailPanel
                  solicitud={selectedSolicitud}
                  saving={saving}
                  assignmentDraft={assignmentDraft}
                  onAssignmentChange={setAssignmentDraft}
                  onEstadoChange={value =>
                    void updateSolicitud(selectedSolicitud.id, {
                      estado: value,
                    })
                  }
                  onSaveAssignment={() =>
                    void updateSolicitud(selectedSolicitud.id, {
                      assigned_to: assignmentDraft.trim() || null,
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
