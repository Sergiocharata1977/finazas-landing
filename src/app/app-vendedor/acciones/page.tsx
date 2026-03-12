'use client';

import { ABMHeader } from '@/components/abm/ABMHeader';
import { ABMViewMode } from '@/components/abm/ABMViewToggle';
import { AccionesGrid } from '@/components/crm/acciones/AccionesGrid';
import { AccionesList } from '@/components/crm/acciones/AccionesList';
import { useAuth } from '@/contexts/AuthContext';
import type { CRMAccion } from '@/types/crmAcciones';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccionesVendedorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const organizationId = user?.organization_id;

  const [viewMode, setViewMode] = useState<ABMViewMode>('list');
  const [acciones, setAcciones] = useState<CRMAccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar acciones
  useEffect(() => {
    if (organizationId && user?.id) {
      loadAcciones();
    } else {
      // Sin usuario autenticado, no cargar
      setLoading(false);
    }
  }, [organizationId, user?.id]);

  const loadAcciones = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/vendedor/acciones?organization_id=${organizationId}&vendedor_id=${user?.id}`
      );
      if (!res.ok) {
        console.error('Error fetching acciones:', res.status);
        setAcciones([]);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAcciones(data.data);
      } else {
        setAcciones([]);
      }
    } catch (error) {
      console.error('Error cargando acciones:', error);
      setAcciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado local
  const filteredAcciones = acciones.filter(accion => {
    const matchesSearch =
      accion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accion.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <ABMHeader
          title="Acciones"
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          currentView={viewMode}
          onViewChange={setViewMode}
          hasKanban={false}
          actions={
            <button
              onClick={() => router.push('/app-vendedor/acciones/nueva')}
              className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          }
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <AccionesList
                acciones={filteredAcciones}
                onDelete={id => console.log('Delete action', id)}
              />
            )}
            {viewMode === 'grid' && (
              <AccionesGrid
                acciones={filteredAcciones}
                onDelete={id => console.log('Delete action', id)}
              />
            )}

            {filteredAcciones.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <p>No se encontraron acciones</p>
                <button
                  onClick={() => router.push('/app-vendedor/acciones/nueva')}
                  className="mt-4 text-primary font-medium"
                >
                  Crear primera acción
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
