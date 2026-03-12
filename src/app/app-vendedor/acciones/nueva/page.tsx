'use client';

import { NuevaAccionForm } from '@/components/crm/acciones/NuevaAccionForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/vendedor/db';
import type { AccionLocal } from '@/types/vendedor';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NuevaAccionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user?.id || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Cargar clientes locales
        // TODO: Si la lista está vacía, quizás intentar sync inicial o fetch API
        // Por ahora asumimos que ya existen o se sincronizaron
        const clientesLocales = await db.clientes
          .where('organizationId')
          .equals(organizationId)
          .toArray();

        // Mapear a formato simple
        const clientesMap = clientesLocales.map(c => ({
          id: c.id,
          nombre: c.razonSocial,
        }));

        setClientes(clientesMap);
      } catch (error) {
        console.error('Error cargando clientes:', error);
        toast.error('Error al cargar clientes locales');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, organizationId]);

  const handleSubmit = async (data: any) => {
    if (!user?.id || !organizationId) {
      toast.error('Sesión no válida');
      return;
    }

    setSaving(true);
    try {
      const nuevaAccion: Omit<
        AccionLocal,
        'id' | 'createdAt' | 'updatedAt' | 'syncStatus'
      > = {
        organizationId: organizationId,
        vendedorId: user.id, // Usar user.id en vez de user.uid
        clienteId: data.clienteId,
        tipo: data.tipo,
        canal: data.canal,
        titulo: data.titulo,
        descripcion: data.descripcion,
        resultado: data.resultado,
        evidenciasIds: [], // TODO: Implementar subida de fotos/audios
        fechaRealizada: new Date().toISOString(), // Asumimos realizada ahora si no se especifica
      };

      await db.createAccion(nuevaAccion);

      toast.success('Acción guardada correctamente (Offline)');
      router.push('/app-vendedor/acciones');
    } catch (error) {
      console.error('Error guardando acción:', error);
      toast.error('Error al guardar la acción');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="bg-white border-b px-4 py-3 flex items-center sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Nueva Acción</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <NuevaAccionForm
            clientes={clientes}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            loading={saving}
          />
        )}
      </main>
    </div>
  );
}
