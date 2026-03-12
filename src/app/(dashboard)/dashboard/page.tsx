'use client';

import { KPIStatCard } from '@/components/design-system/patterns/cards/KPIStatCard';
import {
  ArrowRight,
  BarChart,
  BarChart3,
  Briefcase,
  CheckCircle,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

type TrendDirection = 'up' | 'down' | 'neutral';

type DashboardMetric = {
  title: string;
  value: string;
  change: string;
  trend: TrendDirection;
  subtext: string;
  icon: React.ReactNode;
};

type DashboardModule = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  enabled: boolean;
  stats: Record<string, number>;
};

const metrics: DashboardMetric[] = [
  {
    title: 'OBJETIVOS',
    value: '85%',
    change: '+5%',
    trend: 'up',
    subtext: 'vs mes anterior',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: 'PERSONAL',
    value: '24',
    change: '+2',
    trend: 'up',
    subtext: 'personas activas',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'DOCUMENTOS',
    value: '42',
    change: '+8',
    trend: 'up',
    subtext: 'vigentes',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'CONFORMIDAD',
    value: '92%',
    change: '+3%',
    trend: 'up',
    subtext: 'cumplimiento global',
    icon: <CheckCircle className="h-5 w-5" />,
  },
];

const modules: DashboardModule[] = [
  {
    title: 'Recursos Humanos',
    description: 'Gestion integral de personal, competencias y estructura.',
    icon: Users,
    href: '/dashboard/rrhh',
    enabled: true,
    stats: { personal: 24, departamentos: 6 },
  },
  {
    title: 'Procesos',
    description: 'Mapeo, definicion y control de procesos operativos.',
    icon: Briefcase,
    href: '/procesos',
    enabled: true,
    stats: { procesos: 12, activos: 8 },
  },
  {
    title: 'Calidad',
    description: 'Seguimiento de objetivos, indicadores y satisfaccion.',
    icon: BarChart3,
    href: '/procesos/objetivos',
    enabled: true,
    stats: { objetivos: 15, cumplidos: 13 },
  },
  {
    title: 'Auditorias',
    description: 'Planificacion y ejecucion de auditorias internas.',
    icon: Shield,
    href: '/mejoras/auditorias',
    enabled: true,
    stats: {},
  },
  {
    title: 'Documentos',
    description: 'Control documental y versiones vigentes.',
    icon: FolderOpen,
    href: '/documentos',
    enabled: true,
    stats: {},
  },
  {
    title: 'Reportes',
    description: 'Visualizacion de KPIs y reportes ejecutivos.',
    icon: BarChart,
    href: '/reportes',
    enabled: true,
    stats: {},
  },
];

function formatStats(stats: Record<string, number>) {
  const entries = Object.entries(stats);
  if (entries.length === 0) return 'Sin metricas adicionales';
  return entries.map(([key, value]) => `${key}: ${value}`).join(' | ');
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                <LayoutDashboard className="h-7 w-7 text-emerald-600" />
                Dashboard General
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                Vision general del estado del Sistema de Gestion de Calidad.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Version Beta 2.0
            </span>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <KPIStatCard
              key={metric.title}
              label={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={{ value: metric.change, direction: metric.trend }}
              subtext={metric.subtext}
              className="border-slate-200 bg-white shadow-sm"
            />
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Accesos Directos
            </h2>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              6 modulos
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(module => {
              const ModuleCard = (
                <article className="flex h-full flex-col rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                      <module.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">
                    {module.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">
                    {module.description}
                  </p>
                  <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {formatStats(module.stats)}
                  </p>
                </article>
              );

              if (!module.enabled) {
                return (
                  <div
                    key={module.title}
                    className="cursor-not-allowed opacity-60"
                  >
                    {ModuleCard}
                  </div>
                );
              }

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="block h-full"
                >
                  {ModuleCard}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Resumen Ejecutivo
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Metricas visibles
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">4 KPI</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Modulos activos
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {modules.filter(module => module.enabled).length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Estado general
              </p>
              <p className="mt-1 text-xl font-semibold text-emerald-700">
                Estable
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
