import { ListGrid, ListTable } from '@/components/design-system';
import type { ViewMode } from '@/components/design-system/layout/PageToolbar';
import { formatDate } from '@/lib/utils';
import {
  Finding,
  FINDING_STATUS_COLORS,
  FINDING_STATUS_LABELS,
} from '@/types/findings';
import { useEffect, useState } from 'react';
import { FindingCardCompact } from './FindingCardCompact';
import { FindingFormDialog } from './FindingFormDialog';

interface FindingListProps {
  filters?: {
    status?: string;
    processId?: string;
    year?: number;
    search?: string;
    requiresAction?: boolean;
  };
  viewMode?: ViewMode;
  onRefresh?: () => void;
}

export function FindingList({
  filters,
  viewMode = 'grid',
  onRefresh,
}: FindingListProps) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadFindings = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (filters?.processId) params.append('processId', filters.processId);
      if (filters?.year) params.append('year', filters.year.toString());
      if (filters?.requiresAction !== undefined)
        params.append('requiresAction', filters.requiresAction.toString());

      // Apply filters from props
      if (filters?.status && filters.status !== 'all')
        params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/findings?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar hallazgos');
      }

      const data = await response.json();
      const validFindings = data.findings.filter(
        (f: Finding) => f.registration && f.findingNumber
      );
      setFindings(validFindings);
    } catch (error) {
      console.error('Error loading findings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [filters]);

  // Add listener for refresh events if needed, but prop is better
  useEffect(() => {
    if (onRefresh) {
      // Logic handled by parent re-rendering or passing different props
    }
  }, [onRefresh]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-slate-500">Cargando hallazgos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewMode === 'grid' ? (
        <ListGrid
          data={findings}
          renderItem={finding => (
            <FindingCardCompact key={finding.id} finding={finding} />
          )}
          keyExtractor={finding => finding.id}
          columns={3}
        />
      ) : (
        <ListTable
          data={findings}
          keyExtractor={finding => finding.id}
          onRowClick={finding =>
            (window.location.href = `/mejoras/hallazgos/${finding.id}`)
          }
          columns={[
            {
              header: 'Código',
              accessorKey: 'findingNumber',
              className: 'font-medium font-mono',
            },
            {
              header: 'Nombre',
              cell: f => f.registration?.name || 'Sin nombre',
            },
            {
              header: 'Estado',
              cell: f => (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${FINDING_STATUS_COLORS[f.status] || 'bg-slate-100 text-slate-700'}`}
                >
                  {FINDING_STATUS_LABELS[f.status] || f.status}
                </span>
              ),
            },
            {
              header: 'Fecha',
              cell: f => formatDate(f.createdAt),
            },
            {
              header: 'Progreso',
              cell: f => (
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{f.progress}%</span>
                </div>
              ),
            },
          ]}
        />
      )}

      <FindingFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false);
          loadFindings();
          onRefresh?.();
        }}
      />
    </div>
  );
}
