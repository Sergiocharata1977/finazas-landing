'use client';

import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle,
  Compass,
  DollarSign,
  FileText,
  Layers,
  Package,
  Server,
  Settings,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ProcessItem, ProcessLevelColor, ProcessMetric } from '@/types/process-map';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle,
  Compass,
  DollarSign,
  FileText,
  Layers,
  Package,
  Server,
  Settings,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
  Zap,
};

const COLOR_CLASSES: Record<
  ProcessLevelColor,
  { bg: string; border: string; icon: string; badge: string; hover: string }
> = {
  emerald: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/50',
    icon: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300',
    hover: 'hover:bg-emerald-900/40 hover:border-emerald-600',
  },
  blue: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/50',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
    hover: 'hover:bg-blue-900/40 hover:border-blue-600',
  },
  violet: {
    bg: 'bg-violet-900/20',
    border: 'border-violet-700/50',
    icon: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300',
    hover: 'hover:bg-violet-900/40 hover:border-violet-600',
  },
  amber: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    icon: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    hover: 'hover:bg-amber-900/40 hover:border-amber-600',
  },
};

interface ProcessCardProps {
  item: ProcessItem;
  color: ProcessLevelColor;
  isActive?: boolean;
  metric?: ProcessMetric;
}

export function ProcessCard({ item, color, isActive, metric }: ProcessCardProps) {
  const router = useRouter();
  const IconComponent = ICON_MAP[item.icon ?? ''] ?? Settings;
  const colors = COLOR_CLASSES[color];

  if (!item.visible) return null;

  const isClickable = item.applies && item.route;

  const cardClasses = [
    'relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 min-w-[120px] max-w-[160px] text-center',
    item.applies
      ? `${colors.bg} ${colors.border} ${isClickable ? `cursor-pointer ${colors.hover}` : ''}`
      : 'bg-slate-800/30 border-slate-700/30 opacity-50 cursor-default',
    isActive ? `ring-2 ring-offset-1 ring-offset-slate-900 ring-${color}-500` : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleClick() {
    if (isClickable) router.push(item.route!);
  }

  const hasPending = item.applies && (metric?.pending ?? 0) > 0;
  const hasWarning = item.applies && metric?.status && metric.status !== 'ok';

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      className={cardClasses}
      title={item.applies ? `Ir a ${item.label}` : `${item.label} — no aplica a esta organización`}
    >
      {/* Status dot */}
      {hasWarning && (
        <div
          className={`absolute top-1.5 left-1.5 h-2 w-2 rounded-full ${
            metric?.status === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
          }`}
        />
      )}

      <div
        className={`p-2 rounded-lg ${item.applies ? colors.badge : 'bg-slate-700/30 text-slate-500'}`}
      >
        <IconComponent className="h-4 w-4" />
      </div>
      <span
        className={`text-xs font-medium leading-tight ${
          item.applies ? 'text-slate-200' : 'text-slate-500'
        }`}
      >
        {item.label}
      </span>

      {/* Pending count */}
      {hasPending && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            metric?.status === 'critical'
              ? 'bg-red-900/40 text-red-400'
              : 'bg-amber-900/40 text-amber-400'
          }`}
        >
          {metric!.pending} pend.
        </span>
      )}

      {/* Total when no pending */}
      {item.applies && !hasPending && (metric?.total ?? 0) > 0 && (
        <span className="text-[10px] text-slate-600">{metric!.total}</span>
      )}

      {isClickable && (
        <ArrowRight
          className={`h-3 w-3 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${colors.icon}`}
        />
      )}
      {!item.applies && (
        <span className="text-[10px] text-slate-600 italic">No aplica</span>
      )}
    </div>
  );
}
