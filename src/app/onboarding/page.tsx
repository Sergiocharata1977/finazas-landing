'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  EVENTS,
  trackEvent as trackProductEvent,
} from '@/lib/analytics/events';
import { resolvePostLoginRoute } from '@/lib/auth/postLoginRouting';
import { ISO_CLASSIC_PROCESSES } from '@/types/isoClassicProcesses';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CompanyData, CompanyStep } from './steps/CompanyStep';
import { NormStep } from './steps/NormStep';
import { ProcessStep } from './steps/ProcessStep';
import { SummaryStep } from './steps/SummaryStep';

const STEPS = [
  'Seleccion de sistema',
  'Datos de empresa',
  'Seleccion de norma',
  'Seleccion de procesos',
  'Resumen y provision',
] as const;

const INITIAL_COMPANY: CompanyData = {
  name: '',
  cuit: '',
  sector: '',
  contact: '',
};

type OnboardingMetricEventType =
  | 'onboarding_started'
  | 'onboarding_step_changed'
  | 'provision_requested'
  | 'onboarding_completed_ui'
  | 'onboarding_failed_ui';

interface OnboardingMetricsSummary {
  total_sessions: number;
  successful_onboardings: number;
  average_end_to_end_ms: number | null;
  total_processes_created: number;
  last_completed_at: string | null;
}

interface ContractedSystem {
  systemId: string;
  systemName: string;
  status?: string;
  modulesEnabled?: string[];
}

function formatDuration(durationMs: number | null): string {
  if (!durationMs || durationMs <= 0) return 'N/D';
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyData>(INITIAL_COMPANY);
  const [norm, setNorm] = useState<'iso_9001'>('iso_9001');
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    ISO_CLASSIC_PROCESSES.map(item => item.key)
  );
  const [metricsSummary, setMetricsSummary] =
    useState<OnboardingMetricsSummary | null>(null);
  const [contractedSystems, setContractedSystems] = useState<
    ContractedSystem[]
  >([]);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('iso9001');

  const sessionIdRef = useRef(
    `onb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const startedAtRef = useRef(new Date().toISOString());
  const startedTrackedRef = useRef(false);
  const lastStepRef = useRef(step);

  const canContinue = useMemo(() => {
    if (step === 0) return selectedSystemId === 'iso9001';
    if (step === 1) return company.name.trim().length > 0;
    if (step === 3) return selectedKeys.length > 0;
    return true;
  }, [step, selectedSystemId, company.name, selectedKeys.length]);

  const trackEvent = useCallback(
    async (
      eventType: OnboardingMetricEventType,
      payload?: {
        step?: number;
        success?: boolean;
        duration_ms?: number;
        created_processes?: number;
        skipped_processes?: number;
        created_norm_points?: number;
        skipped_norm_points?: number;
        process_keys_count?: number;
        metadata?: Record<string, unknown>;
      }
    ) => {
      try {
        await fetch('/api/onboarding/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: user?.organization_id || undefined,
            system_id: selectedSystemId,
            session_id: sessionIdRef.current,
            event_type: eventType,
            started_at: startedAtRef.current,
            finished_at:
              eventType === 'onboarding_completed_ui' ||
              eventType === 'onboarding_failed_ui'
                ? new Date().toISOString()
                : undefined,
            ...payload,
          }),
        });
      } catch (eventError) {
        console.warn('[OnboardingPage] metrics event warning:', eventError);
      }
    },
    [selectedSystemId, user?.organization_id]
  );

  const loadMetrics = useCallback(async () => {
    if (!user?.organization_id) return;
    try {
      const response = await fetch('/api/onboarding/metrics?limit=25', {
        method: 'GET',
      });
      const payload = await response.json();
      if (!response.ok || !payload?.success) return;
      setMetricsSummary(payload.data?.summary || null);
    } catch (metricsError) {
      console.warn('[OnboardingPage] metrics read warning:', metricsError);
    }
  }, [user?.organization_id]);

  const loadContractedSystems = useCallback(async () => {
    setSystemsLoading(true);
    try {
      const response = await fetch('/api/onboarding/contracted-systems');
      const payload = await response.json();
      if (response.ok && payload?.success && Array.isArray(payload?.data)) {
        const systems = payload.data as ContractedSystem[];
        setContractedSystems(systems);
        const hasIso = systems.some(sys => sys.systemId === 'iso9001');
        setSelectedSystemId(
          hasIso ? 'iso9001' : (systems[0]?.systemId ?? 'iso9001')
        );
      }
    } catch (systemsError) {
      console.warn(
        '[OnboardingPage] contracted systems warning:',
        systemsError
      );
      setContractedSystems([]);
      setSelectedSystemId('iso9001');
    } finally {
      setSystemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    // Existing organization users should not manually enter onboarding.
    if (user.organization_id) {
      router.replace(resolvePostLoginRoute(user));
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user || startedTrackedRef.current) return;
    if (user.organization_id) return;

    startedTrackedRef.current = true;
    void trackEvent('onboarding_started', {
      step: 0,
      process_keys_count: selectedKeys.length,
      metadata: {
        norm,
        system_id: selectedSystemId,
      },
    });
    void loadContractedSystems();
    void loadMetrics();
  }, [
    loadContractedSystems,
    loadMetrics,
    norm,
    selectedKeys.length,
    selectedSystemId,
    trackEvent,
    user,
  ]);

  useEffect(() => {
    if (!startedTrackedRef.current) return;
    if (step === lastStepRef.current) return;

    const completedStep = lastStepRef.current;
    lastStepRef.current = step;
    void trackEvent('onboarding_step_changed', { step });
    trackProductEvent(EVENTS.ONBOARDING_STEP, {
      step: completedStep,
      nextStep: step,
      orgId: user?.organization_id || null,
      systemId: selectedSystemId,
    });
  }, [selectedSystemId, step, trackEvent, user?.organization_id]);

  const submitProvision = async () => {
    if (!user?.organization_id) {
      setError(
        'Tu cuenta no tiene una organizacion asignada. Selecciona sistema y solicita asignacion antes de provisionar.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      void trackEvent('provision_requested', {
        step,
        process_keys_count: selectedKeys.length,
      });

      const response = await fetch('/api/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: user?.organization_id || undefined,
          system_id: selectedSystemId,
          company,
          norm,
          process_keys: selectedKeys,
          telemetry: {
            session_id: sessionIdRef.current,
            started_at: startedAtRef.current,
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'No se pudo provisionar');
      }

      const data = payload.data;
      setResult(
        `Provision completada. Procesos creados: ${data.createdProcesses}, omitidos: ${data.skippedProcesses}. Puntos de norma creados: ${data.createdNormPoints}, omitidos: ${data.skippedNormPoints}.`
      );
      await trackEvent('onboarding_completed_ui', {
        step,
        success: true,
        duration_ms: Math.max(
          0,
          Date.now() - new Date(startedAtRef.current).getTime()
        ),
        created_processes: data.createdProcesses,
        skipped_processes: data.skippedProcesses,
        created_norm_points: data.createdNormPoints,
        skipped_norm_points: data.skippedNormPoints,
        process_keys_count: selectedKeys.length,
      });
      await loadMetrics();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
      await trackEvent('onboarding_failed_ui', {
        step,
        success: false,
        duration_ms: Math.max(
          0,
          Date.now() - new Date(startedAtRef.current).getTime()
        ),
        process_keys_count: selectedKeys.length,
        metadata: { error: message },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {authLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-slate-500">
            Verificando sesion...
          </CardContent>
        </Card>
      ) : user?.organization_id ? (
        <Card>
          <CardContent className="py-8 text-sm text-slate-500">
            Redirigiendo a tu espacio de organizacion...
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Federado de Plataforma</CardTitle>
            <p className="text-sm text-slate-500">
              Paso {step + 1} de {STEPS.length}: {STEPS[step]}
            </p>
            {metricsSummary && (
              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 md:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="font-medium text-slate-700">
                    Tiempo e2e promedio
                  </p>
                  <p>{formatDuration(metricsSummary.average_end_to_end_ms)}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="font-medium text-slate-700">
                    Onboardings exitosos
                  </p>
                  <p>
                    {metricsSummary.successful_onboardings} /{' '}
                    {metricsSummary.total_sessions}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="font-medium text-slate-700">Procesos creados</p>
                  <p>{metricsSummary.total_processes_created}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                  <p className="font-medium text-slate-700">
                    Ultimo completado
                  </p>
                  <p>
                    {metricsSummary.last_completed_at
                      ? new Date(
                          metricsSummary.last_completed_at
                        ).toLocaleString()
                      : 'N/D'}
                  </p>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Selecciona el software contratado para esta organizacion.
                </p>
                {systemsLoading ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    Cargando sistemas contratados...
                  </div>
                ) : contractedSystems.length === 0 ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    No hay sistemas contratados configurados. Se usara ISO 9001
                    por compatibilidad.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contractedSystems.map(system => {
                      const selected = selectedSystemId === system.systemId;
                      const supported = system.systemId === 'iso9001';
                      return (
                        <button
                          type="button"
                          key={system.systemId}
                          onClick={() => setSelectedSystemId(system.systemId)}
                          className={`rounded-lg border p-3 text-left transition ${
                            selected
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <p className="font-medium text-slate-900">
                            {system.systemName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            ID: {system.systemId}
                          </p>
                          {!supported && (
                            <p className="text-xs text-amber-700 mt-2">
                              Onboarding especifico pendiente para este sistema.
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedSystemId !== 'iso9001' && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                    Por ahora solo esta habilitado el wizard ISO 9001.
                    Selecciona ISO 9001 para continuar.
                  </div>
                )}
              </div>
            )}
            {step === 1 && (
              <CompanyStep value={company} onChange={setCompany} />
            )}
            {step === 2 && <NormStep value={norm} onChange={setNorm} />}
            {step === 3 && (
              <ProcessStep
                selectedKeys={selectedKeys}
                onChange={setSelectedKeys}
              />
            )}
            {step === 4 && (
              <SummaryStep
                company={company}
                norm={norm}
                selectedKeys={selectedKeys}
              />
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {result && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 space-y-3">
                <p>{result}</p>
                <p className="text-emerald-600">
                  Tu sistema de gestión de calidad está listo. El próximo paso
                  es completar la base estratégica de tu organización.
                </p>
                <Button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/planificacion-revision-direccion?onboarding=1'
                    )
                  }
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  Continuar: completar estrategia →
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(prev => Math.max(prev - 1, 0))}
                disabled={step === 0 || loading}
              >
                Anterior
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={() =>
                    setStep(prev => Math.min(prev + 1, STEPS.length - 1))
                  }
                  disabled={!canContinue || loading}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submitProvision}
                  disabled={loading}
                >
                  {loading ? 'Provisionando...' : 'Confirmar y provisionar'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
