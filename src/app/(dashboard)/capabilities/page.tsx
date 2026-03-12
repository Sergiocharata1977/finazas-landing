'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  CapabilityTier,
  InstalledCapability,
  PlatformCapability,
} from '@/types/plugins';
import {
  BarChart2,
  Bot,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe,
  Layers,
  Loader2,
  Lock,
  Puzzle,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingCart,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const SYSTEM_ID = 'iso9001';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart2,
  Bot,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe,
  Layers,
  Puzzle,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Wrench,
};

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
  },
  sky: { bg: 'bg-sky-100', text: 'text-sky-700', ring: 'ring-sky-200' },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    ring: 'ring-amber-200',
  },
  red: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    ring: 'ring-purple-200',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    ring: 'ring-indigo-200',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    ring: 'ring-slate-200',
  },
};

const TIER_BADGE: Record<CapabilityTier, string> = {
  base: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  opcional: 'border-amber-200 bg-amber-50 text-amber-700',
  premium: 'border-sky-200 bg-sky-50 text-sky-700',
};

const TIER_LABEL: Record<CapabilityTier, string> = {
  base: 'Base',
  opcional: 'Opcional',
  premium: 'Premium',
};

const STATUS_META = {
  active: {
    label: 'Activo',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  inactive: {
    label: 'Inactivo',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
  },
  available: {
    label: 'Disponible',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
    dotClass: 'bg-amber-500',
  },
  premium: {
    label: 'Requiere upgrade',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
    dotClass: 'bg-sky-500',
  },
} as const;

type InstalledCapabilityWithPlatform = InstalledCapability & {
  platform_capability?: PlatformCapability | null;
};

type CapabilityResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type CapabilityCardModel = {
  id: string;
  name: string;
  description: string;
  tier: CapabilityTier;
  icon: string;
  color: string;
  installed: boolean;
  enabled: boolean;
  locked: boolean;
};

function getIcon(
  iconName: string
): React.ComponentType<{ className?: string }> {
  return ICON_MAP[iconName] ?? Puzzle;
}

function mergeCapabilities(
  installed: InstalledCapabilityWithPlatform[],
  available: PlatformCapability[]
): CapabilityCardModel[] {
  const installedById = new Map(
    installed.map(item => [item.capability_id, item])
  );
  const catalog = new Map<string, PlatformCapability>();

  available.forEach(item => {
    catalog.set(item.id, item);
  });

  installed.forEach(item => {
    if (item.platform_capability) {
      catalog.set(item.capability_id, item.platform_capability);
    }
  });

  return Array.from(catalog.values())
    .map(platform => {
      const installedCapability = installedById.get(platform.id);
      const isPremiumLocked =
        platform.tier === 'premium' && !installedCapability;

      return {
        id: platform.id,
        name: platform.name,
        description: platform.description,
        tier: platform.tier,
        icon: platform.icon ?? 'Puzzle',
        color: platform.color ?? 'slate',
        installed: Boolean(installedCapability),
        enabled: Boolean(installedCapability?.enabled),
        locked: isPremiumLocked,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

type CapabilityCardProps = {
  capability: CapabilityCardModel;
  submittingId: string | null;
  onInstall: (id: string) => void;
  onToggle: (id: string, enable: boolean) => void;
};

function CapabilityCard({
  capability,
  submittingId,
  onInstall,
  onToggle,
}: CapabilityCardProps) {
  const isBusy = submittingId === capability.id;
  const Icon = getIcon(capability.icon);
  const color = COLOR_MAP[capability.color] ?? COLOR_MAP.slate;
  const status = capability.locked
    ? STATUS_META.premium
    : capability.installed && capability.enabled
      ? STATUS_META.active
      : capability.installed
        ? STATUS_META.inactive
        : STATUS_META.available;

  return (
    <article
      className={[
        'relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all',
        capability.locked
          ? 'border-sky-200/80'
          : 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md',
      ].join(' ')}
    >
      {capability.locked ? (
        <div className="absolute right-4 top-4 rounded-full border border-sky-200 bg-sky-50 p-2 text-sky-700">
          <Lock className="h-4 w-4" />
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color.bg} ring-1 ${color.ring}`}
        >
          <Icon className={`h-5 w-5 ${color.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {capability.name}
            </h2>
            <Badge variant="outline" className={TIER_BADGE[capability.tier]}>
              {TIER_LABEL[capability.tier]}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {capability.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Badge variant="outline" className={status.badgeClass}>
          <span className={`mr-1.5 h-2 w-2 rounded-full ${status.dotClass}`} />
          {status.label}
        </Badge>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {capability.locked ? (
            <Button
              size="sm"
              variant="outline"
              className="border-sky-200 text-sky-700 hover:bg-sky-50"
              asChild
            >
              <Link href="/contacto">Ver plan Premium</Link>
            </Button>
          ) : capability.installed ? (
            <Button
              size="sm"
              variant={capability.enabled ? 'outline' : 'default'}
              disabled={isBusy}
              onClick={() => onToggle(capability.id, !capability.enabled)}
            >
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {capability.enabled ? 'Desactivar' : 'Activar'}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() => onInstall(capability.id)}
            >
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Instalar
            </Button>
          )}
        </div>

        <Link
          href={`/capabilities/${capability.id}`}
          className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-800 hover:underline"
        >
          Ver ficha →
        </Link>
      </div>
    </article>
  );
}

type CapabilitySectionProps = {
  title: string;
  count: number;
  items: CapabilityCardModel[];
  emptyLabel: string;
  submittingId: string | null;
  onInstall: (id: string) => void;
  onToggle: (id: string, enable: boolean) => void;
};

function CapabilitySection({
  title,
  count,
  items,
  emptyLabel,
  submittingId,
  onInstall,
  onToggle,
}: CapabilitySectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <Badge variant="outline" className="border-slate-200 bg-slate-50">
          {count}
        </Badge>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(item => (
            <CapabilityCard
              key={item.id}
              capability={item}
              submittingId={submittingId}
              onInstall={onInstall}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-sm text-slate-500">
          {emptyLabel}
        </div>
      )}
    </section>
  );
}

export default function CapabilitiesMarketplacePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installed, setInstalled] = useState<InstalledCapabilityWithPlatform[]>(
    []
  );
  const [available, setAvailable] = useState<PlatformCapability[]>([]);
  const [search, setSearch] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const canManage = ['admin', 'super_admin'].includes(user?.rol ?? '');

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [installedRes, availableRes] = await Promise.all([
        fetch(`/api/capabilities/installed?system_id=${SYSTEM_ID}`, {
          cache: 'no-store',
        }),
        fetch(`/api/capabilities/available?system_id=${SYSTEM_ID}`, {
          cache: 'no-store',
        }),
      ]);

      const [installedJson, availableJson] = (await Promise.all([
        installedRes.json(),
        availableRes.json(),
      ])) as [
        CapabilityResponse<InstalledCapabilityWithPlatform[]>,
        CapabilityResponse<PlatformCapability[]>,
      ];

      if (!installedRes.ok || !installedJson.success) {
        throw new Error(
          installedJson.error ||
            'No se pudieron obtener las capabilities instaladas'
        );
      }

      if (!availableRes.ok || !availableJson.success) {
        throw new Error(
          availableJson.error ||
            'No se pudieron obtener las capabilities disponibles'
        );
      }

      setInstalled(Array.isArray(installedJson.data) ? installedJson.data : []);
      setAvailable(Array.isArray(availableJson.data) ? availableJson.data : []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'No se pudo cargar el marketplace de Powers'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!canManage) {
      setLoading(false);
      return;
    }

    void refreshData();
  }, [authLoading, canManage]);

  const runMutation = async (
    capabilityId: string,
    config: {
      url: string;
      method: 'POST' | 'PUT';
      body: Record<string, unknown>;
      successTitle: string;
      successDescription: string;
      fallbackError: string;
    }
  ) => {
    try {
      setSubmittingId(capabilityId);

      const response = await fetch(config.url, {
        method: config.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.body),
      });
      const json = (await response.json()) as CapabilityResponse<unknown>;

      if (!response.ok || !json.success) {
        throw new Error(json.error || config.fallbackError);
      }

      toast({
        title: config.successTitle,
        description: config.successDescription,
      });
      await refreshData();
    } catch (mutationError) {
      toast({
        title: 'Error',
        description:
          mutationError instanceof Error
            ? mutationError.message
            : config.fallbackError,
        variant: 'destructive',
      });
    } finally {
      setSubmittingId(current =>
        current === capabilityId ? null : current
      );
    }
  };

  const handleInstall = (capabilityId: string) => {
    void runMutation(capabilityId, {
      url: '/api/capabilities/install',
      method: 'POST',
      body: {
        capability_id: capabilityId,
        system_id: SYSTEM_ID,
        enabled: true,
      },
      successTitle: 'Power instalado',
      successDescription: 'El Power quedó activo en el tenant.',
      fallbackError: 'No se pudo instalar el Power',
    });
  };

  const handleToggle = (capabilityId: string, enable: boolean) => {
    void runMutation(capabilityId, {
      url: `/api/capabilities/${capabilityId}/toggle`,
      method: 'PUT',
      body: { enabled: enable },
      successTitle: enable ? 'Power activado' : 'Power desactivado',
      successDescription: enable
        ? 'El Power vuelve a estar operativo.'
        : 'El Power quedó instalado pero inactivo.',
      fallbackError: 'No se pudo actualizar el Power',
    });
  };

  const capabilities = useMemo(
    () => mergeCapabilities(installed, available),
    [installed, available]
  );

  const filteredCapabilities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return capabilities;
    }

    return capabilities.filter(capability =>
      capability.name.toLowerCase().includes(query)
    );
  }, [capabilities, search]);

  const activeCapabilities = useMemo(
    () =>
      filteredCapabilities.filter(
        capability => capability.installed && capability.enabled
      ),
    [filteredCapabilities]
  );

  const availableCapabilities = useMemo(
    () =>
      filteredCapabilities.filter(
        capability =>
          !capability.locked &&
          ((capability.installed && !capability.enabled) ||
            !capability.installed)
      ),
    [filteredCapabilities]
  );

  const premiumCapabilities = useMemo(
    () => filteredCapabilities.filter(capability => capability.locked),
    [filteredCapabilities]
  );

  if (authLoading || loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando Powers...
          </div>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="p-6 md:p-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            Esta pantalla solo está disponible para roles admin y super_admin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      <PageHeader
        title="Powers"
        description="Potenciá tu sistema con módulos adicionales"
      />

      {error ? (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Error de carga</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar por nombre"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
            >
              {activeCapabilities.length} activos
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 px-3 py-1 text-slate-700"
            >
              {availableCapabilities.length} disponibles
            </Badge>
          </div>
        </div>
      </section>

      <CapabilitySection
        title={`Activos (${activeCapabilities.length})`}
        count={activeCapabilities.length}
        items={activeCapabilities}
        emptyLabel="No hay Powers activos para la búsqueda actual."
        submittingId={submittingId}
        onInstall={handleInstall}
        onToggle={handleToggle}
      />

      <CapabilitySection
        title={`Disponibles para activar (${availableCapabilities.length})`}
        count={availableCapabilities.length}
        items={availableCapabilities}
        emptyLabel="No hay Powers disponibles para activar en este momento."
        submittingId={submittingId}
        onInstall={handleInstall}
        onToggle={handleToggle}
      />

      <CapabilitySection
        title={`Premium (${premiumCapabilities.length})`}
        count={premiumCapabilities.length}
        items={premiumCapabilities}
        emptyLabel="No hay Powers premium pendientes de upgrade."
        submittingId={submittingId}
        onInstall={handleInstall}
        onToggle={handleToggle}
      />
    </div>
  );
}
