import { db } from '@/firebase/adminConfig';
import type { FinanceTenantConfig } from '@/types/financeConfig';
import { FINANCE_CONFIG_DEFAULTS } from '@/types/financeConfig';

const COLLECTION = 'organizations';
const SUBCOLLECTION = 'finance_config';
const DOC_ID = 'parameters';

export class FinanceConfigService {
  /**
   * Carga la config financiera del tenant.
   * Si no existe en Firestore, devuelve los defaults del modelo Excel.
   */
  static async get(orgId: string): Promise<FinanceTenantConfig> {
    const ref = db
      .collection(COLLECTION)
      .doc(orgId)
      .collection(SUBCOLLECTION)
      .doc(DOC_ID);

    const snap = await ref.get();

    if (!snap.exists) {
      return {
        organization_id: orgId,
        updated_at: new Date().toISOString(),
        ...FINANCE_CONFIG_DEFAULTS,
      };
    }

    const data = snap.data() as FinanceTenantConfig;
    return data;
  }

  /**
   * Guarda (merge completo) la config financiera del tenant.
   */
  static async save(
    orgId: string,
    config: Omit<FinanceTenantConfig, 'organization_id' | 'updated_at'>,
    updatedBy: string
  ): Promise<FinanceTenantConfig> {
    const ref = db
      .collection(COLLECTION)
      .doc(orgId)
      .collection(SUBCOLLECTION)
      .doc(DOC_ID);

    const payload: FinanceTenantConfig = {
      ...config,
      organization_id: orgId,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    };

    await ref.set(payload);
    return payload;
  }

  /**
   * Devuelve la tasa nominal anual para un plan de cuotas específico.
   * Busca primero en planes_cuotas (configurable), luego en tasas (legacy).
   */
  static getTasaParaPlan(
    config: FinanceTenantConfig,
    cuotas: number
  ): number {
    const plan = config.planes_cuotas.find(p => p.cuotas === cuotas && p.activo);
    if (plan) return plan.tasa_nominal_anual;

    // fallback a campos directos
    if (cuotas === 3) return config.tasas.cuotas_3;
    if (cuotas === 6) return config.tasas.cuotas_6;
    if (cuotas === 12) return config.tasas.cuotas_12;
    return config.tasas.financiacion_saldos;
  }

  /**
   * Devuelve solo los planes activos, ordenados por cuotas.
   */
  static getPlanesCuotasActivos(
    config: FinanceTenantConfig
  ): FinanceTenantConfig['planes_cuotas'] {
    return [...config.planes_cuotas]
      .filter(p => p.activo)
      .sort((a, b) => a.cuotas - b.cuotas);
  }
}
