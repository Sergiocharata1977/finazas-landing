'use client';

import { usePathname } from 'next/navigation';
import { ProcessCard } from './ProcessCard';
import type { ProcessLevel, ProcessMetric } from '@/types/process-map';
import { ChevronDown } from 'lucide-react';

const LEVEL_LABEL_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-700/40',
  blue:    'bg-blue-500/20    text-blue-300    border-blue-700/40',
  violet:  'bg-violet-500/20  text-violet-300  border-violet-700/40',
  amber:   'bg-amber-500/20   text-amber-300   border-amber-700/40',
};

const LINE_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-700/40',
  blue:    'bg-blue-700/40',
  violet:  'bg-violet-700/40',
  amber:   'bg-amber-700/40',
};

interface ProcessLevelRowProps {
  level: ProcessLevel;
  isLast: boolean;
  metrics?: Record<string, ProcessMetric>;
}

export function ProcessLevelRow({ level, isLast, metrics }: ProcessLevelRowProps) {
  const pathname = usePathname();
  const sorted = [...level.items]
    .filter(i => i.visible)
    .sort((a, b) => a.order - b.order);

  const labelColor = LEVEL_LABEL_COLORS[level.color] ?? LEVEL_LABEL_COLORS.emerald;
  const lineColor  = LINE_COLORS[level.color]        ?? LINE_COLORS.emerald;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Level header */}
      <div className="flex items-center gap-3 mb-4 w-full max-w-4xl">
        <span
          className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest ${labelColor}`}
        >
          Nivel {level.level}
        </span>
        <span className="text-slate-400 text-sm font-semibold">{level.title}</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* Cards row */}
      <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl pb-2 group">
        {sorted.map(item => (
          <ProcessCard
            key={item.processKey}
            item={item}
            color={level.color}
            isActive={item.route ? pathname?.startsWith(item.route) : false}
            metric={metrics?.[item.processKey]}
          />
        ))}
      </div>

      {/* Arrow connector to next level */}
      {!isLast && (
        <div className="flex flex-col items-center my-2">
          <div className={`w-0.5 h-5 ${lineColor}`} />
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}
