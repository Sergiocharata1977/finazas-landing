'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DocModule } from '@/types/docs';

const MODULE_STYLES: Record<DocModule, { label: string; className: string }> = {
  'mi-panel': {
    label: 'Mi Panel',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  rrhh: {
    label: 'RRHH',
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  procesos: {
    label: 'Procesos',
    className: 'border-cyan-200 bg-cyan-50 text-cyan-800',
  },
  documentos: {
    label: 'Documentos',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  crm: {
    label: 'CRM',
    className: 'border-violet-200 bg-violet-50 text-violet-800',
  },
  auditorias: {
    label: 'Auditorias',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
  },
  hallazgos: {
    label: 'Hallazgos',
    className: 'border-orange-200 bg-orange-50 text-orange-800',
  },
  acciones: {
    label: 'Acciones',
    className: 'border-lime-200 bg-lime-50 text-lime-800',
  },
  onboarding: {
    label: 'Onboarding',
    className: 'border-blue-200 bg-blue-50 text-blue-800',
  },
  'iso-design': {
    label: 'Diseno',
    className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
  },
  'iso-infra': {
    label: 'Infraestructura',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
  'don-candido': {
    label: 'Don Candido',
    className: 'border-slate-200 bg-slate-100 text-slate-800',
  },
  dealer: {
    label: 'Dealer',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
};

export function getDocModuleLabel(module: DocModule): string {
  return MODULE_STYLES[module]?.label ?? module;
}

interface DocBadgeProps {
  module: DocModule;
  className?: string;
}

export function DocBadge({ module, className }: DocBadgeProps) {
  const style = MODULE_STYLES[module];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', style.className, className)}
    >
      {style.label}
    </Badge>
  );
}
