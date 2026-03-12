'use client';

import { DonCandidoAvatar } from '@/components/ui/DonCandidoAvatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  FASES_ISO_9001,
  getDefaultJourneyProgress,
  PhaseProgress,
} from '@/features/journey/types/journey';
import { cn } from '@/lib/utils';
import { JourneyService } from '@/services/JourneyService';
import { ChevronRight, Clock, Lock, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RoadmapTab() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PhaseProgress[]>(
    getDefaultJourneyProgress()
  );
  const [loading, setLoading] = useState(true);
  const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadJourneyProgress = async () => {
      if (!user?.organization_id) {
        if (mounted) {
          setProgress(getDefaultJourneyProgress());
          setLoading(false);
        }
        return;
      }

      const journeyProgress = await JourneyService.getJourneyProgress(
        user.organization_id
      );

      if (!mounted) return;
      setProgress(journeyProgress);
      setLoading(false);
    };

    loadJourneyProgress();

    return () => {
      mounted = false;
    };
  }, [user?.organization_id]);

  const totalTareas = FASES_ISO_9001.reduce(
    (acc, f) => acc + f.tareas.filter(t => t.esRequerida).length,
    0
  );
  const tareasCompletadas = progress.reduce(
    (acc, p) => acc + p.tareasCompletadas.length,
    0
  );
  const progresoGlobal =
    totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;
  const faseActual =
    progress.find(p => p.status === 'in_progress') ||
    progress.find(p => p.status === 'available');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full p-2 flex-shrink-0">
            <DonCandidoAvatar mood="saludo" className="w-full h-full" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Tu Camino hacia ISO 9001
            </h2>
            <p className="text-emerald-100 text-sm">
              6 fases para implementar tu Sistema de Gestion de Calidad
            </p>
            {loading && (
              <p className="text-emerald-50 text-xs mt-1">
                Cargando progreso real...
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Progreso Global</span>
            <span className="font-bold text-white">{progresoGlobal}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progresoGlobal}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>
              {tareasCompletadas} de {totalTareas} tareas
            </span>
            {faseActual && (
              <span>
                Fase actual:{' '}
                {FASES_ISO_9001.find(f => f.id === faseActual.phaseId)
                  ?.nombreCorto || ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {FASES_ISO_9001.map(fase => {
          const faseProgress = progress.find(p => p.phaseId === fase.id);
          const status = faseProgress?.status || 'locked';
          const porcentaje = faseProgress?.porcentaje || 0;
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const isActive = status === 'in_progress' || status === 'available';

          return (
            <div
              key={fase.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all',
                isLocked && 'opacity-60',
                isActive && 'ring-2 ring-emerald-500'
              )}
            >
              <div className={cn('p-5 bg-gradient-to-r', fase.colorPrimario)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fase.icono}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-xs font-medium">
                          FASE {fase.id}
                        </span>
                        {isCompleted && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs">
                            Completada
                          </span>
                        )}
                        {isActive && !isCompleted && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-white text-xs animate-pulse">
                            En progreso
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {fase.nombre}
                      </h3>
                    </div>
                  </div>
                  {!isLocked ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPhaseId(prev =>
                          prev === fase.id ? null : fase.id
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      Ver{' '}
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedPhaseId === fase.id && 'rotate-90'
                        )}
                      />
                    </button>
                  ) : (
                    <Lock className="w-5 h-5 text-white/50" />
                  )}
                </div>
                {isActive && (
                  <div className="mt-3">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-white/80 text-xs mt-1">
                      {porcentaje}% completado
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {fase.descripcion}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {fase.clausulasISO.map(c => (
                    <span
                      key={c}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                    >
                      Clausula {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>
                      {fase.tareas.filter(t => t.esRequerida).length} tareas
                      requeridas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~2-3 semanas</span>
                  </div>
                </div>
                {expandedPhaseId === fase.id && (
                  <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-4">
                    {fase.tareas.length > 0 || fase.clausulasISO.length > 0 ? (
                      <>
                        {fase.tareas.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              Tareas de la fase
                            </h4>
                            <ul className="space-y-1">
                              {fase.tareas.map(tarea => (
                                <li
                                  key={tarea.id}
                                  className="text-sm text-gray-600 dark:text-gray-300"
                                >
                                  - {tarea.titulo}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {fase.clausulasISO.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              Clausulas ISO asociadas
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {fase.clausulasISO.map(c => (
                                <span
                                  key={`detail-${fase.id}-${c}`}
                                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                                >
                                  Clausula {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 bg-white/70 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Detalle de esta fase en construccion. Progreso:{' '}
                          {porcentaje}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
