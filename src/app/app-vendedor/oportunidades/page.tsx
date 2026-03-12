// src/app/app-vendedor/oportunidades/page.tsx
// Lista de oportunidades asignadas al vendedor - Rediseñada

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EstadoTabs } from '@/components/vendedor/EstadoTabs';
import { NuevaOportunidadDialog } from '@/components/vendedor/NuevaOportunidadDialog';
import { OportunidadCard } from '@/components/vendedor/OportunidadCard';
import { useAuth } from '@/contexts/AuthContext';
import type { EstadoClienteKanban } from '@/types/crm';
import type { OportunidadCRM } from '@/types/crm-oportunidad';
import { ArrowLeft, Loader2, Plus, Search, Target } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MisOportunidadesPage() {
  const { user, loading: authLoading } = useAuth();
  const organizationId = user?.organization_id;
  const [oportunidades, setOportunidades] = useState<OportunidadCRM[]>([]);
  const [estados, setEstados] = useState<EstadoClienteKanban[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNuevaOportunidad, setShowNuevaOportunidad] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!organizationId || !user?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Cargar estados Kanban
        const estadosRes = await fetch(
          `/api/crm/kanban/estados?organization_id=${organizationId}`
        );
        const estadosData = await estadosRes.json();
        if (estadosData.success) {
          setEstados(estadosData.data);
        }

        // Cargar oportunidades - sin filtro de vendedor por ahora
        const opRes = await fetch(
          `/api/crm/oportunidades?organization_id=${organizationId}`
        );
        const opData = await opRes.json();

        console.log('Oportunidades loaded:', opData);

        if (opData.success) {
          setOportunidades(opData.data || []);
        } else {
          console.error('Error loading opportunities:', opData.error);
          setOportunidades([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setOportunidades([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [organizationId, user?.id]);

  // Filtrar oportunidades
  const filteredOportunidades = oportunidades.filter(op => {
    // Filtro por estado
    if (selectedEstado !== 'all' && op.estado_kanban_id !== selectedEstado) {
      return false;
    }

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        op.nombre.toLowerCase().includes(query) ||
        op.organizacion_nombre.toLowerCase().includes(query) ||
        op.contacto_nombre?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Contar oportunidades por estado
  const counts: Record<string, number> = {
    all: oportunidades.filter(op => op.isActive).length,
  };
  estados.forEach(estado => {
    counts[estado.id] = oportunidades.filter(
      op => op.estado_kanban_id === estado.id && op.isActive
    ).length;
  });

  // Separar activas de cerradas
  const activas = filteredOportunidades.filter(op => op.isActive);
  const cerradas = filteredOportunidades.filter(op => !op.isActive);

  // Calcular total en pipeline
  const totalPipeline = activas.reduce(
    (sum, op) => sum + (op.monto_estimado || 0),
    0
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <p className="text-red-500 font-medium mb-2">Error de Configuración</p>
        <p className="text-gray-500 text-sm">
          Tu usuario no tiene una organización asignada. Contactá a soporte.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-14 z-30">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/app-vendedor">
              <Button variant="ghost" size="icon" className="touch-target">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 Mis Oportunidades
              </h1>
              <p className="text-sm text-gray-500">
                {activas.length} activas • $
                {totalPipeline.toLocaleString('es-AR')} en pipeline
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar oportunidad, cliente o contacto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 touch-target"
            />
          </div>
        </div>

        {/* Tabs de estados */}
        <div className="px-4 pb-3">
          <EstadoTabs
            estados={estados}
            selectedEstado={selectedEstado}
            onSelectEstado={setSelectedEstado}
            counts={counts}
          />
        </div>
      </div>

      {/* Lista de oportunidades */}
      <div className="p-4 space-y-3">
        {activas.length === 0 && searchQuery === '' ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">
              No tenés oportunidades activas
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Creá tu primera oportunidad para comenzar
            </p>
            <Button
              onClick={() => setShowNuevaOportunidad(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Oportunidad
            </Button>
          </div>
        ) : activas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No se encontraron oportunidades con "{searchQuery}"
            </p>
          </div>
        ) : (
          <>
            {activas.map(op => (
              <OportunidadCard key={op.id} oportunidad={op} />
            ))}
          </>
        )}

        {/* Oportunidades cerradas */}
        {cerradas.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-500 mb-3 px-2">
              Cerradas ({cerradas.length})
            </h2>
            <div className="space-y-3 opacity-60">
              {cerradas.slice(0, 5).map(op => (
                <OportunidadCard key={op.id} oportunidad={op} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {activas.length > 0 && (
        <button
          onClick={() => setShowNuevaOportunidad(true)}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center touch-target"
          aria-label="Nueva oportunidad"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Dialog Nueva Oportunidad */}
      {organizationId && user && (
        <NuevaOportunidadDialog
          open={showNuevaOportunidad}
          onOpenChange={setShowNuevaOportunidad}
          onSuccess={() => {
            // Recargar oportunidades
            window.location.reload();
          }}
          organizationId={organizationId}
          vendedorId={user.personnel_id || user.id}
          vendedorNombre={user.email?.split('@')[0] || 'Vendedor'}
        />
      )}
    </div>
  );
}
