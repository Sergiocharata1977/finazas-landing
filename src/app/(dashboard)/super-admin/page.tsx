'use client';

import { PageHeader } from '@/components/design-system';
import { BaseCard } from '@/components/design-system/primitives/BaseCard';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Building2,
  MessageSquare,
  Palette,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  pendingDemoRequests: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    pendingDemoRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch organizations
      const orgsResponse = await fetch('/api/super-admin/organizations');
      const orgsData = await orgsResponse.json();

      // Fetch demo requests
      const demoResponse = await fetch('/api/super-admin/demo-requests');
      const demoData = await demoResponse.json();

      if (!orgsResponse.ok || !demoResponse.ok) {
        const orgError = orgsData?.error || orgsData?.message;
        const demoError = demoData?.error || demoData?.message;
        setError(orgError || demoError || 'No se pudo cargar el dashboard.');
      }

      setStats({
        totalOrganizations: orgsData.organizations?.length || 0,
        activeOrganizations:
          orgsData.organizations?.filter((org: any) => org.status === 'active')
            .length || 0,
        totalUsers: 0, // TODO: Implement global user count
        pendingDemoRequests:
          demoData.data?.filter((req: any) => req.status === 'pending')
            .length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <PageHeader
          title="Dashboard Super Admin"
          description="Panel de control global del sistema Don Cándido IA"
          breadcrumbs={[
            { label: 'Super Admin', href: '/super-admin' },
            { label: 'Dashboard' },
          ]}
        />

        {error && (
          <BaseCard
            padding="md"
            className="border border-amber-200 bg-amber-50"
          >
            <p className="text-sm text-amber-800">
              No se pudieron cargar todos los datos de Super Admin. Detalle:{' '}
              {error}
            </p>
          </BaseCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Organizaciones"
            value={loading ? '...' : stats.totalOrganizations}
            subtitle={`${stats.activeOrganizations} activas`}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
            href="/super-admin/organizaciones"
          />
          <StatCard
            title="Usuarios Globales"
            value={loading ? '...' : stats.totalUsers}
            subtitle="En todas las organizaciones"
            icon={<Users className="w-6 h-6" />}
            color="emerald"
            href="/super-admin/usuarios"
          />
          <StatCard
            title="Solicitudes Demo"
            value={loading ? '...' : stats.pendingDemoRequests}
            subtitle="Pendientes de revisión"
            icon={<MessageSquare className="w-6 h-6" />}
            color="amber"
            href="/super-admin/demo-requests"
          />
          <StatCard
            title="Estadísticas"
            value="Ver"
            subtitle="Métricas globales"
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
            href="/super-admin/stats"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organizations Quick Access */}
          <BaseCard padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Gestión de Organizaciones
                </h3>
              </div>
              <Link href="/super-admin/organizaciones/nueva">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Administra organizaciones, usuarios y configuraciones multi-tenant
            </p>
            <div className="space-y-2">
              <QuickLink
                href="/super-admin/organizaciones"
                label="Ver todas las organizaciones"
              />
              <QuickLink
                href="/super-admin/organizaciones/nueva"
                label="Crear nueva organización"
              />
            </div>
          </BaseCard>

          {/* System Tools */}
          <BaseCard padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">
                Herramientas del Sistema
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Acceso rápido a configuración y monitoreo del sistema
            </p>
            <div className="space-y-2">
              <QuickLink
                href="/super-admin/design-system"
                label="Design System"
                icon={<Palette className="w-4 h-4" />}
              />
              <QuickLink
                href="/super-admin/stats"
                label="Estadísticas Globales"
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <QuickLink
                href="/super-admin/maturity"
                label="Madurez del Sistema"
              />
            </div>
          </BaseCard>
        </div>

        {/* Recent Activity / System Status */}
        <BaseCard padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold">Estado del Sistema</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SystemStatusItem
              label="Servidor"
              status="Operativo"
              variant="success"
            />
            <SystemStatusItem
              label="Base de Datos"
              status="Operativo"
              variant="success"
            />
            <SystemStatusItem
              label="Almacenamiento"
              status="Operativo"
              variant="success"
            />
          </div>
        </BaseCard>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  href: string;
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Link href={href}>
      <BaseCard
        padding="lg"
        className="hover:shadow-lg transition-shadow cursor-pointer h-full"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>{icon}</div>
        </div>
      </BaseCard>
    </Link>
  );
}

function QuickLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SystemStatusItem({
  label,
  status,
  variant,
}: {
  label: string;
  status: string;
  variant: 'success' | 'warning' | 'error';
}) {
  const variantMap = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${variantMap[variant]}`}
      >
        {status}
      </span>
    </div>
  );
}
