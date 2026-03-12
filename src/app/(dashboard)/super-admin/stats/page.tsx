'use client';

import { PageHeader } from '@/components/design-system';
import { BaseCard } from '@/components/design-system/primitives/BaseCard';
import { BookOpen, Building2, TimerReset, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface MaturityOrg {
  organizationId: string;
  maturityScore: number;
}

interface ProductMetricsResponse {
  overview: {
    organizations: number;
    onboardingCompletionRate: number;
    completedOnboardingCount: number;
    averageTtfvMs: number | null;
  };
  docsMostConsulted: Array<{
    route: string;
    module: string;
    opens: number;
  }>;
}

function formatDuration(durationMs: number | null): string {
  if (!durationMs || durationMs <= 0) return 'N/D';
  const totalMinutes = Math.round(durationMs / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
}

export default function SuperAdminStatsPage() {
  const [rows, setRows] = useState<MaturityOrg[]>([]);
  const [productMetrics, setProductMetrics] =
    useState<ProductMetricsResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [maturityRes, productRes] = await Promise.all([
          fetch('/api/super-admin/maturity', {
            cache: 'no-store',
          }),
          fetch('/api/super-admin/product-metrics', {
            cache: 'no-store',
          }),
        ]);
        const maturityJson = await maturityRes.json();
        const productJson = await productRes.json();
        if (maturityRes.ok && Array.isArray(maturityJson.organizations)) {
          setRows(maturityJson.organizations);
        }
        if (productRes.ok && productJson?.success) {
          setProductMetrics(productJson.data);
        }
      } catch {
        setRows([]);
        setProductMetrics(null);
      }
    };
    load();
  }, []);

  const avgScore = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.round(
      rows.reduce((acc, x) => acc + (x.maturityScore || 0), 0) / rows.length
    );
  }, [rows]);

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      <PageHeader
        title="Estadísticas"
        description="Resumen global del estado multisistema."
        breadcrumbs={[
          { label: 'Super Admin', href: '/super-admin' },
          { label: 'Estadísticas' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <BaseCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Organizaciones</p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </div>
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
        </BaseCard>
        <BaseCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Madurez promedio</p>
              <p className="text-2xl font-bold">{avgScore}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
        </BaseCard>
        <BaseCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Onboarding completo</p>
              <p className="text-2xl font-bold">
                {productMetrics?.overview.onboardingCompletionRate ?? 0}%
              </p>
              <p className="text-xs text-slate-500">
                {productMetrics?.overview.completedOnboardingCount ?? 0} orgs
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-cyan-600" />
          </div>
        </BaseCard>
        <BaseCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">TTFV promedio</p>
              <p className="text-2xl font-bold">
                {formatDuration(productMetrics?.overview.averageTtfvMs ?? null)}
              </p>
            </div>
            <TimerReset className="h-6 w-6 text-amber-600" />
          </div>
        </BaseCard>
        <BaseCard padding="md">
          <div>
            <p className="text-sm text-slate-500">Detalle</p>
            <Link
              className="text-sm font-medium text-cyan-700 hover:underline"
              href="/super-admin/stats/organizaciones"
            >
              Ver uso por organización
            </Link>
          </div>
        </BaseCard>
      </div>

      <BaseCard padding="md">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Docs mas consultadas
          </h2>
        </div>
        <div className="space-y-3">
          {(productMetrics?.docsMostConsulted || []).slice(0, 5).map(doc => (
            <div
              key={`${doc.module}:${doc.route}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{doc.route}</p>
                <p className="text-sm text-slate-500">{doc.module}</p>
              </div>
              <p className="text-sm font-semibold text-emerald-700">
                {doc.opens} aperturas
              </p>
            </div>
          ))}
          {(!productMetrics ||
            productMetrics.docsMostConsulted.length === 0) && (
            <p className="text-sm text-slate-500">
              Todavia no hay eventos de documentacion instrumentados.
            </p>
          )}
        </div>
      </BaseCard>
    </div>
  );
}
