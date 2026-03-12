'use client';

import { ActionCard } from '@/components/actions/ActionCard';
import { ActionFormDialog } from '@/components/actions/ActionFormDialog';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import type { Action, ActionStatus } from '@/types/actions';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const KANBAN_COLUMNS: {
  status: ActionStatus;
  label: string;
  color: string;
}[] = [
  {
    status: 'planificada',
    label: 'Planificadas',
    color: 'border-slate-300 bg-slate-50',
  },
  {
    status: 'ejecutada',
    label: 'Ejecutadas',
    color: 'border-blue-300 bg-blue-50',
  },
  {
    status: 'en_control',
    label: 'En Control',
    color: 'border-amber-300 bg-amber-50',
  },
  {
    status: 'completada',
    label: 'Completadas',
    color: 'border-emerald-300 bg-emerald-50',
  },
];

export function ActionKanban() {
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Edit/Delete
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deletingAction, setDeletingAction] = useState<Action | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/actions');

      if (!response.ok) {
        throw new Error('Error al cargar las acciones');
      }

      const data = await response.json();
      setActions(data.actions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar las acciones'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingAction) return;

    try {
      const response = await fetch(`/api/actions/${editingAction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al actualizar la acción');

      toast({
        title: 'Acción actualizada',
        description: 'La acción se ha actualizado correctamente',
      });
      fetchActions();
      setEditingAction(null);
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la acción',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingAction) return;

    try {
      setIsDeleteLoading(true);
      const response = await fetch(`/api/actions/${deletingAction.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: 'Usuario' }),
      });

      if (!response.ok) throw new Error('Error al eliminar la acción');

      toast({
        title: 'Acción eliminada',
        description: 'La acción se ha eliminado correctamente',
      });
      fetchActions();
      setDeletingAction(null);
    } catch (error) {
      console.error('Error deleting action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la acción',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const getActionsByStatus = (status: ActionStatus) => {
    return actions.filter(
      action => action.status === status && action.isActive
    );
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KANBAN_COLUMNS.map(column => {
        const columnActions = getActionsByStatus(column.status);

        return (
          <div key={column.status} className="flex flex-col">
            {/* Column Header */}
            <div
              className={`border-t-4 ${column.color} bg-white shadow-sm rounded-t-lg px-4 py-3 flex items-center justify-between mb-2`}
            >
              <h3 className="font-semibold text-slate-900">{column.label}</h3>
              <span className="bg-slate-100 px-2 py-1 rounded-full text-xs font-medium text-slate-600">
                {columnActions.length}
              </span>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-slate-50/50 rounded-b-lg p-2 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnActions.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-lg m-2">
                  No hay acciones
                </div>
              ) : (
                columnActions.map(action => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onEdit={setEditingAction}
                    onDelete={setDeletingAction}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Dialogs */}
      {editingAction && (
        <ActionFormDialog
          open={!!editingAction}
          onClose={() => setEditingAction(null)}
          onSubmit={handleEdit}
          initialData={{
            title: editingAction.title,
            description: editingAction.description,
            actionType: editingAction.actionType,
            priority: editingAction.priority,
            sourceType: editingAction.sourceType,
            sourceName: editingAction.sourceName,
            processId: editingAction.processId || '',
            processName: editingAction.processName || '',
            implementationResponsibleId:
              editingAction.planning.responsiblePersonId,
            implementationResponsibleName:
              editingAction.planning.responsiblePersonName,
            plannedExecutionDate: editingAction.planning.plannedDate.toDate(),
            planningObservations: editingAction.planning.observations || '',
          }}
          findingId={editingAction.findingId || undefined}
          findingNumber={editingAction.findingNumber || undefined}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingAction}
        onClose={() => setDeletingAction(null)}
        onConfirm={handleDelete}
        title="Eliminar Acción"
        itemName={deletingAction?.actionNumber || ''}
        itemType="acción"
      />
    </div>
  );
}
