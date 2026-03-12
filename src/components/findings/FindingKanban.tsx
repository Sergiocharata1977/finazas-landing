import { FindingCard } from '@/components/findings/FindingCard';
import { FindingFormDialog } from '@/components/findings/FindingFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import type { Finding, FindingStatus } from '@/types/findings';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const KANBAN_COLUMNS: {
  status: FindingStatus;
  label: string;
  color: string;
}[] = [
  {
    status: 'registrado',
    label: 'Registrados',
    color: 'bg-gray-100 border-gray-300',
  },
  {
    status: 'en_tratamiento',
    label: 'En Tratamiento',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    status: 'cerrado',
    label: 'Cerrados',
    color: 'bg-green-100 border-green-300',
  },
];

interface FindingKanbanProps {
  filters?: {
    status?: string; // Although Kanban separates by status, global filter could hide some? Usually Kanban shows all statuses as columns, but maybe filter by other things?
    // Actually, if I filter by status in Kanban, I should probably filter the *cards* but keep columns?
    // Or maybe Kanban ignores status filter? Let's implement generic filters first.
    processId?: string;
    year?: number;
    search?: string;
    requiresAction?: boolean;
  };
}

export function FindingKanban({ filters }: FindingKanbanProps) {
  const { toast } = useToast();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Edit/Delete
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [deletingFinding, setDeletingFinding] = useState<Finding | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    fetchFindings();
  }, [filters]);

  const fetchFindings = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters?.processId) params.append('processId', filters.processId);
      if (filters?.year) params.append('year', filters.year.toString());
      if (filters?.requiresAction !== undefined)
        params.append('requiresAction', filters.requiresAction.toString());

      // Apply search
      if (filters?.search) params.append('search', filters.search);
      // Note: We typically don't filter by status in Kanban because columns represent status,
      // strictly speaking unless user selects "All" status, or specific one.
      // If user selects "Cerrado", should we only show "Cerrado" column?
      // For now, let's respect status filter if provided:
      if (filters?.status && filters.status !== 'all')
        params.append('status', filters.status);

      const response = await fetch(`/api/findings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar los hallazgos');
      }

      const data = await response.json();
      // Filtrar hallazgos válidos
      const validFindings = (data.findings || []).filter(
        (f: Finding) => f.registration && f.findingNumber && f.isActive
      );
      setFindings(validFindings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar los hallazgos'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFinding) return;

    try {
      setIsDeleteLoading(true);
      const response = await fetch(`/api/findings/${deletingFinding.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: 'Usuario' }),
      });

      if (!response.ok) throw new Error('Error al eliminar el hallazgo');

      toast({
        title: 'Hallazgo eliminado',
        description: 'El hallazgo se ha eliminado correctamente',
      });
      fetchFindings();
      setDeletingFinding(null);
    } catch (error) {
      console.error('Error deleting finding:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el hallazgo',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getFindingsByStatus = (status: FindingStatus) => {
    return findings.filter(finding => finding.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(column => {
        // If status filter is active and not 'all', and doesn't match column, maybe hide column?
        // For now, let's just show empty columns if filtered out by API.
        const columnFindings = getFindingsByStatus(column.status);

        return (
          <div key={column.status} className="flex-shrink-0 w-80">
            {/* Column Header */}
            <div
              className={`${column.color} border-0 rounded-t-lg px-4 py-3 font-semibold`}
            >
              <div className="flex items-center justify-between">
                <span>{column.label}</span>
                <span className="bg-white px-2 py-1 rounded-full text-sm">
                  {columnFindings.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="bg-gray-50 border-0 rounded-b-lg p-4 min-h-[500px] space-y-3">
              {columnFindings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay hallazgos
                </p>
              ) : (
                columnFindings.map(finding => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    onEdit={setEditingFinding}
                    onDelete={setDeletingFinding}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Dialogs */}
      {editingFinding && (
        <FindingFormDialog
          open={!!editingFinding}
          onOpenChange={open => !open && setEditingFinding(null)}
          initialData={{
            name: editingFinding.registration.name,
            description: editingFinding.registration.description,
            sourceType: editingFinding.registration.sourceType,
            sourceId: editingFinding.registration.sourceId || undefined,
            sourceName: editingFinding.registration.sourceName || undefined,
            processId: editingFinding.registration.processId || '',
            processName: editingFinding.registration.processName || '',
            normPoints: editingFinding.registration.normPoints,
          }}
          onSuccess={() => {
            fetchFindings();
            setEditingFinding(null);
          }}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingFinding}
        onClose={() => setDeletingFinding(null)}
        onConfirm={handleDelete}
        title="Eliminar Hallazgo"
        itemName={deletingFinding?.findingNumber || ''}
        itemType="hallazgo"
      />
    </div>
  );
}
