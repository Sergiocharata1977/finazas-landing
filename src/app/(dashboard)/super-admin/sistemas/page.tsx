'use client';

import { PageHeader } from '@/components/design-system';
import { BaseCard } from '@/components/design-system/primitives/BaseCard';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  TrendingUp,
  Wheat,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

/* ─── Icon map (server returns icon name as string) ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  TrendingUp,
  Wheat,
  Server,
};

/* ─── Color palettes ─── */
const COLOR_MAP: Record<
  string,
  { bg: string; text: string; ring: string; badge: string }
> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    badge:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    ring: 'ring-rose-200 dark:ring-rose-800',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    ring: 'ring-amber-200 dark:ring-amber-800',
    badge:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-400',
    ring: 'ring-slate-200 dark:ring-slate-700',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  },
};

const STATUS_ICONS: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  online: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Online' },
  degraded: { icon: AlertCircle, color: 'text-amber-500', label: 'Degradado' },
  offline: { icon: CircleDot, color: 'text-red-500', label: 'Offline' },
  unknown: { icon: Activity, color: 'text-slate-400', label: 'Sin datos' },
};

interface SystemUI {
  id: string;
  name: string;
  description: string;
  url: string;
  color: string;
  icon: string;
  status: string;
  version?: string;
  modules: string[];
  health?: {
    status: string;
    responseTimeMs?: number;
    lastChecked: string;
  };
  stats?: {
    totalOrganizations: number;
    activeOrganizations: number;
  };
}

export default function SuperAdminSistemasPage() {
  const [systems, setSystems] = useState<SystemUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);

  const loadSystems = useCallback(async () => {
    try {
      const res = await fetch('/api/super-admin/systems');
      const json = await res.json();
      if (res.ok && Array.isArray(json.systems)) {
        setSystems(json.systems);
      }
    } catch {
      setSystems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystems();
  }, [loadSystems]);

  const seedSystems = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/super-admin/systems/seed', {
        method: 'POST',
      });
      if (res.ok) {
        await loadSystems();
      }
    } finally {
      setSeeding(false);
    }
  };

  const checkHealth = async (systemId: string) => {
    setChecking(systemId);
    try {
      const res = await fetch(`/api/super-admin/systems/${systemId}`);
      const json = await res.json();
      if (res.ok && json.health) {
        setSystems(prev =>
          prev.map(s =>
            s.id === systemId
              ? { ...s, health: json.health, stats: json.stats }
              : s
          )
        );
      }
    } finally {
      setChecking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      <PageHeader
        title="Sistemas de Plataforma"
        description="Registro federado de todos los productos desplegados. Monitoreá salud, organizaciones y módulos."
        breadcrumbs={[
          { label: 'Super Admin', href: '/super-admin' },
          { label: 'Sistemas' },
        ]}
      />

      {/* Empty state → seed */}
      {systems.length === 0 && (
        <BaseCard padding="lg">
          <div className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">
              Sin sistemas registrados
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Inicializá los 3 sistemas de la plataforma (ISO 9001, Finanzas,
              SIG-Agro)
            </p>
            <Button onClick={seedSystems} disabled={seeding}>
              {seeding ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Inicializando...
                </>
              ) : (
                'Inicializar 3 sistemas'
              )}
            </Button>
          </div>
        </BaseCard>
      )}

      {/* Systems grid */}
      {systems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {systems.map(system => {
            const colors = COLOR_MAP[system.color] || COLOR_MAP.slate;
            const IconComponent = ICON_MAP[system.icon] || Server;
            const health = system.health;
            const healthInfo = STATUS_ICONS[health?.status || 'unknown'];
            const HealthIcon = healthInfo.icon;

            return (
              <BaseCard
                key={system.id}
                padding="none"
                className="overflow-hidden"
              >
                {/* Header */}
                <div className={`p-5 ${colors.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${colors.ring} bg-white dark:bg-slate-800`}
                      >
                        <IconComponent className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {system.name}
                        </h3>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.badge}`}
                        >
                          v{system.version || '?'} · {system.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                    {system.description}
                  </p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  {/* Health status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HealthIcon className={`w-4 h-4 ${healthInfo.color}`} />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {healthInfo.label}
                      </span>
                      {health?.responseTimeMs && (
                        <span className="text-xs text-slate-400">
                          {health.responseTimeMs}ms
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => checkHealth(system.id)}
                      disabled={checking === system.id}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-slate-400 ${
                          checking === system.id ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Stats */}
                  {system.stats && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">
                        {system.stats.activeOrganizations} orgs activas
                      </span>
                      <span className="text-slate-400">
                        / {system.stats.totalOrganizations} total
                      </span>
                    </div>
                  )}

                  {/* Modules */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                      Módulos ({system.modules?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(system.modules || []).slice(0, 6).map(mod => (
                        <span
                          key={mod}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {mod}
                        </span>
                      ))}
                      {(system.modules?.length || 0) > 6 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                          +{system.modules.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link */}
                  <a
                    href={system.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-cyan-700 dark:text-cyan-400 hover:underline mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {system.url}
                  </a>
                </div>
              </BaseCard>
            );
          })}
        </div>
      )}

      {/* Summary table */}
      {systems.length > 0 && (
        <BaseCard padding="lg">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Resumen federado
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-500 font-medium">
                    Sistema
                  </th>
                  <th className="text-center py-2 text-slate-500 font-medium">
                    Estado
                  </th>
                  <th className="text-center py-2 text-slate-500 font-medium">
                    Módulos
                  </th>
                  <th className="text-center py-2 text-slate-500 font-medium">
                    Versión
                  </th>
                </tr>
              </thead>
              <tbody>
                {systems.map(s => {
                  const colors = COLOR_MAP[s.color] || COLOR_MAP.slate;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <td className="py-2.5">
                        <span className={`font-medium ${colors.text}`}>
                          {s.name}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            s.status === 'active'
                              ? 'text-emerald-600'
                              : s.status === 'maintenance'
                                ? 'text-amber-600'
                                : 'text-slate-400'
                          }`}
                        >
                          <CircleDot className="w-3 h-3" />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-slate-600">
                        {s.modules?.length || 0}
                      </td>
                      <td className="py-2.5 text-center text-slate-500">
                        v{s.version || '?'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </BaseCard>
      )}
    </div>
  );
}
