'use client';

import {
  PageHeader,
  PageToolbar,
  Section,
} from '@/components/design-system/layout';
import {
  KanbanItem,
  UnifiedKanban,
} from '@/components/design-system/patterns/kanban';
import { KanbanColumnDef } from '@/components/design-system/patterns/kanban/kanbanTypes';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import { ProcessRecord } from '@/types/procesos';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

interface ProcessKanbanProps {
  processId: string;
  processName: string;
  showHeader?: boolean;
  onNewRecord?: () => void;
  onEditRecord?: (record: ProcessRecord) => void;
  onViewRecord?: (record: ProcessRecord) => void;
}

// Configuración de columnas
const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: 'pendiente',
    title: 'Pendiente',
    color: 'bg-amber-500',
    allowDrop: true,
    order: 1,
  },
  {
    id: 'en-progreso',
    title: 'En Progreso',
    color: 'bg-blue-500',
    allowDrop: true,
    order: 2,
  },
  {
    id: 'completado',
    title: 'Completado',
    color: 'bg-green-500',
    allowDrop: true,
    order: 3,
  },
];

export const ProcessKanban: React.FC<ProcessKanbanProps> = ({
  processId,
  processName,
  showHeader = true,
  onNewRecord,
  onEditRecord,
  onViewRecord,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const estado =
        selectedEstado === 'todos' ? undefined : (selectedEstado as any);
      const data = await ProcessRecordService.getFiltered(
        processId,
        searchTerm,
        estado
      );
      setRecords(data || []);
    } catch (err) {
      console.error('Error al cargar registros:', err);
      toast({ title: 'Error cargando registros', variant: 'destructive' });
      setRecords([]);
    } finally {
      setLoadingData(false);
    }
  }, [processId, searchTerm, selectedEstado, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transformar datos a formato Kanban
  const kanbanItems: KanbanItem[] = records.map(record => ({
    id: record.id,
    title: record.titulo,
    description: record.descripcion,
    status: record.estado,
    priority:
      record.prioridad === 'alta'
        ? 'high'
        : record.prioridad === 'media'
          ? 'medium'
          : 'low',
    assignee: { name: record.responsable }, // Fix: Wrap string in object
    dueDate: record.fecha_vencimiento
      ? new Date(record.fecha_vencimiento).toLocaleDateString()
      : undefined,
    tags: [record.prioridad],
    meta: {},
  }));

  // Handlers
  const handleItemMove = async (itemId: string, targetColumnId: string) => {
    try {
      // Optimistic update
      setRecords(prev =>
        prev.map(r =>
          r.id === itemId ? { ...r, estado: targetColumnId as any } : r
        )
      );

      await ProcessRecordService.moveToState(itemId, targetColumnId as any);
      toast({ title: 'Registro actualizado', duration: 2000 });
    } catch (error) {
      console.error('Error moviendo item:', error);
      toast({ title: 'Error al mover registro', variant: 'destructive' });
      fetchData(); // Rollback/Refresh
    }
  };

  const handleItemClick = (item: KanbanItem) => {
    const record = records.find(r => r.id === item.id);
    if (record && onViewRecord) onViewRecord(record);
    else if (record)
      router.push(`/dashboard/procesos/${processId}/registros/${record.id}`);
  };

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          title="Tablero de Registros"
          subtitle={`Gestionando: ${processName}`}
        >
          <Button
            onClick={onNewRecord}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Registro
          </Button>
        </PageHeader>
      ) : null}

      <Section>
        <PageToolbar
          searchValue={searchTerm}
          onSearch={setSearchTerm}
          viewMode="kanban"
          supportedViews={['kanban']}
        >
          <div className="w-[180px]">
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="en-progreso">En Progreso</SelectItem>
                <SelectItem value="completado">Completados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageToolbar>

        <div className="h-[600px] mt-4">
          <UnifiedKanban
            columns={KANBAN_COLUMNS}
            items={kanbanItems}
            onItemMove={handleItemMove}
            onItemClick={handleItemClick}
          />
        </div>
      </Section>
    </div>
  );
};
