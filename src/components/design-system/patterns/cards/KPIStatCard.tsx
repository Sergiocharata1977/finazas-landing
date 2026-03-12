'use client';

import { cn } from '@/lib/utils';
import { BaseCard } from '../../primitives/BaseCard';
import { ProgressBar } from '../../primitives/ProgressBar';
import { typography } from '../../tokens';

interface KPIStatCardProps {
  /** Uppercase label — e.g. "VALOR CERRADO DEL BOLETO" */
  label: string;
  /** Main display value — e.g. "U$D 2.400.000" */
  value: string;
  /** Optional progress bar (0-100) */
  progress?: {
    value: number;
    label?: string;
    color?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  };
  /** Optional date or subtext */
  subtext?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional trend indicator */
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function KPIStatCard({
  label,
  value,
  progress,
  subtext,
  icon,
  trend,
  className,
}: KPIStatCardProps) {
  return (
    <BaseCard className={cn('flex flex-col justify-between', className)}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={typography.label}>{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-3">
          <span className={typography.display}>{value}</span>
          {trend && (
            <span
              className={cn(
                'text-sm font-semibold flex items-center gap-0.5',
                trend.direction === 'up' &&
                  'text-emerald-600 dark:text-emerald-400',
                trend.direction === 'down' && 'text-red-600 dark:text-red-400',
                trend.direction === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.direction === 'neutral' && '→'}
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {progress && (
        <div className="mt-4">
          <ProgressBar
            value={progress.value}
            color={progress.color || 'primary'}
            label={progress.label}
            showPercentage
            size="sm"
          />
        </div>
      )}

      {subtext && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>📅</span>
          <span>{subtext}</span>
        </div>
      )}
    </BaseCard>
  );
}
