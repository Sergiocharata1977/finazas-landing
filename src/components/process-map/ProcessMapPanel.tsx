'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_PROCESS_MAP_CONFIG } from '@/lib/processMap/defaultConfig';
import type { ProcessMapConfig } from '@/types/process-map';
import { ProcessLevelRow } from './ProcessLevelRow';
import { useProcessMetrics } from '@/hooks/useProcessMetrics';
import { Network } from 'lucide-react';

export function ProcessMapPanel() {
  const { user } = useAuth();
  const [config, setConfig] = useState<ProcessMapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { metrics } = useProcessMetrics();

  useEffect(() => {
    const orgId = (user as any)?.organization_id;
    if (!orgId) {
      setConfig(DEFAULT_PROCESS_MAP_CONFIG);
      setLoading(false);
      return;
    }

    const ref = doc(db, 'organizations', orgId, 'ui_config', 'process_map');

    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = snap.data() as ProcessMapConfig;
          setConfig(data?.levels?.length ? data : DEFAULT_PROCESS_MAP_CONFIG);
        } else {
          setConfig(DEFAULT_PROCESS_MAP_CONFIG);
        }
        setLoading(false);
      },
      err => {
        // permission-denied u otro error → fallback a default
        if (err?.code !== 'permission-denied') {
          console.warn('[ProcessMapPanel] Firestore error:', err.message);
        }
        setConfig(DEFAULT_PROCESS_MAP_CONFIG);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [(user as any)?.organization_id]);

  const levels = config
    ? [...config.levels].sort((a, b) => a.level - b.level)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-full max-w-4xl animate-pulse">
            <div className="h-6 bg-slate-800 rounded-full w-48 mb-4" />
            <div className="flex gap-3 justify-center">
              {Array.from({ length: i === 1 ? 3 : i === 2 ? 4 : i === 3 ? 4 : 7 }).map((_, j) => (
                <div key={j} className="h-24 w-32 bg-slate-800 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header del panel */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
        <div className="p-2 bg-emerald-900/30 rounded-lg">
          <Network className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Mapa de Procesos</h2>
          <p className="text-xs text-slate-500">
            Interacciones del Sistema de Gestión de Calidad — ISO 9001:2015 cláusula 4.4
          </p>
        </div>
        <span className="ml-auto text-[11px] px-2 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg font-mono">
          ISO 4.4
        </span>
      </div>

      {/* Niveles */}
      <div className="flex flex-col items-center gap-2">
        {levels.map((level, idx) => (
          <ProcessLevelRow
            key={level.level}
            level={level}
            isLast={idx === levels.length - 1}
            metrics={metrics}
          />
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-600 mt-8">
        Los procesos marcados como "No aplica" están deshabilitados para esta organización.
        La configuración es personalizable por organización.
      </p>
    </div>
  );
}
