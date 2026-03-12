'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bot, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type {
  CapabilityTier,
  PlatformCapability,
  PlatformCapabilityStatus,
} from '@/types/plugins';

type FilterTier = 'all' | CapabilityTier;
type FilterStatus = 'all' | PlatformCapabilityStatus;

const tierBadgeClass: Record<CapabilityTier, string> = {
  base: 'bg-emerald-100 text-emerald-700',
  opcional: 'bg-amber-100 text-amber-700',
  premium: 'bg-sky-100 text-sky-700',
};

const tierLabel: Record<CapabilityTier, string> = {
  base: 'Base',
  opcional: 'Opcional',
  premium: 'Premium',
};

const statusDotClass: Record<PlatformCapabilityStatus, string> = {
  active: 'bg-emerald-500',
  beta: 'bg-amber-500',
  deprecated: 'bg-red-500',
};

const statusLabel: Record<PlatformCapabilityStatus, string> = {
  active: 'Activo',
  beta: 'Beta',
  deprecated: 'Deprecado',
};

export default function CapabilitiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [capabilities, setCapabilities] = useState<PlatformCapability[]>([]);
  const [filteredCapabilities, setFilteredCapabilities] = useState<
    PlatformCapability[]
  >([]);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<FilterTier>('all');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deprecatingId, setDeprecatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.rol !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    void fetchCapabilities();
  }, [user, router]);

  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const next = capabilities.filter(capability => {
      if (tier !== 'all' && capability.tier !== tier) {
        return false;
      }

      if (status !== 'all' && capability.status !== status) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        capability.name.toLowerCase().includes(normalizedSearch) ||
        capability.id.toLowerCase().includes(normalizedSearch)
      );
    });

    setFilteredCapabilities(next);
  }, [capabilities, search, tier, status]);

  async function fetchCapabilities() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/super-admin/capabilities', {
        cache: 'no-store',
      });
      const json = (await response.json()) as
        | PlatformCapability[]
        | {
            data?: PlatformCapability[];
            error?: string;
            message?: string;
          };

      if (!response.ok) {
        const message =
          (typeof json === 'object' && !Array.isArray(json) && (json.error || json.message)) ||
          'No se pudo cargar el catalogo de Powers.';
        setError(message);
        setCapabilities([]);
        return;
      }

      const data = Array.isArray(json) ? json : json.data ?? [];
      setCapabilities(data);
    } catch (fetchError) {
      console.error('Error al cargar capabilities:', fetchError);
      setError('Error de conexion al cargar el catalogo de Powers.');
      setCapabilities([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeprecate(capability: PlatformCapability) {
    const confirmed = window.confirm(
      `Deprecar el Power "${capability.name}" (${capability.id})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeprecatingId(capability.id);

      const response = await fetch(
        `/api/super-admin/capabilities/${capability.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'deprecated' }),
        }
      );

      const json = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        toast({
          title: 'No se pudo deprecar',
          description:
            json.error || json.message || 'La operacion no pudo completarse.',
          variant: 'destructive',
        });
        return;
      }

      setCapabilities(current =>
        current.map(item =>
          item.id === capability.id ? { ...item, status: 'deprecated' } : item
        )
      );

      toast({
        title: 'Power deprecado',
        description: `${capability.name} fue marcado como deprecado.`,
      });
    } catch (deprecateError) {
      console.error('Error al deprecar capability:', deprecateError);
      toast({
        title: 'Error de conexion',
        description: 'No se pudo deprecar el Power.',
        variant: 'destructive',
      });
    } finally {
      setDeprecatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Cargando catalogo de Powers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader title="Catalogo de Powers" />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar por nombre o ID"
          className="md:max-w-sm"
        />

        <Select
          value={tier}
          onValueChange={value => setTier(value as FilterTier)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Todos los tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tiers</SelectItem>
            <SelectItem value="base">Base</SelectItem>
            <SelectItem value="opcional">Opcional</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={value => setStatus(value as FilterStatus)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="beta">Beta</SelectItem>
            <SelectItem value="deprecated">Deprecado</SelectItem>
          </SelectContent>
        </Select>

        <Button asChild className="md:ml-auto">
          <Link href="/super-admin/capabilities/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Power
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Icono + Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Tier
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Estado
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Version
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Sistemas
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">
                  Dependencias
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCapabilities.map(capability => (
                <tr
                  key={capability.id}
                  className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {capability.name}
                        </p>
                        {capability.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {capability.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {capability.id}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tierBadgeClass[capability.tier]}`}
                    >
                      {tierLabel[capability.tier]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusDotClass[capability.status]}`}
                      />
                      <span className="text-slate-700">
                        {statusLabel[capability.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {capability.version}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {capability.system_ids.length > 0
                      ? capability.system_ids.join(', ')
                      : '-'}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {capability.dependencies &&
                    capability.dependencies.length > 0
                      ? capability.dependencies.join(', ')
                      : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/super-admin/capabilities/${capability.id}`}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Editar
                        </Link>
                      </Button>

                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/super-admin/capabilities/${capability.id}/instalaciones`}
                        >
                          Ver instalaciones
                        </Link>
                      </Button>

                      {capability.status !== 'deprecated' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={deprecatingId === capability.id}
                          onClick={() => void handleDeprecate(capability)}
                        >
                          {deprecatingId === capability.id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                          )}
                          Deprecar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCapabilities.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No se encontraron Powers con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
