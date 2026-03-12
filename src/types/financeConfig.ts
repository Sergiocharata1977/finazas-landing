/**
 * Configuración financiera por tenant (organización).
 *
 * Se persiste en Firestore: organizations/{orgId}/finance_config/parameters
 *
 * Basada en los parámetros del modelo Excel "Análisis a 5 años - Tarjeta de Crédito".
 * Cada campo tiene el valor default del modelo Excel como referencia.
 */

// ---------------------------------------------------------------------------
// Tasas por tipo de operación
// ---------------------------------------------------------------------------

export interface TasasConfig {
  /** Tasa nominal anual para financiación de saldos (%). Ej: 8 */
  financiacion_saldos: number;

  /** Tasa nominal anual para cuotas de compras en 3 cuotas (%). */
  cuotas_3: number;

  /** Tasa nominal anual para cuotas de compras en 6 cuotas (%). */
  cuotas_6: number;

  /** Tasa nominal anual para cuotas de compras en 12 cuotas (%). */
  cuotas_12: number;

  /** Tasa nominal anual para adelantos de efectivo (%). Ej: 8 */
  adelantos: number;

  /** Costo de fondeo / inversor (%). Ej: 3.75 */
  costo_fondeo: number;
}

// ---------------------------------------------------------------------------
// Planes de cuotas disponibles para la org
// ---------------------------------------------------------------------------

export interface PlanCuotasConfig {
  /** Cantidad de cuotas habilitada. Ej: 3, 6, 12 */
  cuotas: number;
  /** Tasa nominal anual para este plan (%). */
  tasa_nominal_anual: number;
  /** Etiqueta visible para el operador. Ej: "3 cuotas sin interés" */
  label: string;
  /** Si este plan está activo para nuevas operaciones. */
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Parámetros de comercios (para modelo dealer/tarjeta)
// ---------------------------------------------------------------------------

export interface ComerciosConfig {
  /** Descuento que se cobra al comercio por usar la tarjeta (%). Ej: 5 */
  descuento_comercio: number;

  /** Tasa de pago expreso que se cobra al comercio (%). Ej: 8 */
  tasa_pago_expreso: number;

  /** Días de financiación a comercios en promedio. Ej: 21 */
  dias_financiacion_promedio: number;

  /** Días de pago expreso. Ej: 15 */
  dias_pago_expreso: number;

  /** % de comercios que usan pago expreso. Ej: 50 */
  porcentaje_pago_expreso: number;

  /** Arancel fijo a comercios (%). Ej: 100 = aplica el 100% del descuento */
  arancel_comercios: number;
}

// ---------------------------------------------------------------------------
// Parámetros de mora y riesgo
// ---------------------------------------------------------------------------

export interface MoraConfig {
  /** % de mora esperada sobre compras. Ej: 10 */
  mora_prevista: number;

  /** % de recupero sobre la mora. Ej: 30 */
  recupero_mora: number;

  /** Tasa punitoria anual (%). Se suma a la tasa base al vencer. */
  tasa_punitoria: number;

  /** Días de gracia antes de marcar cuota como vencida. Ej: 3 */
  dias_gracia: number;
}

// ---------------------------------------------------------------------------
// Ingresos por servicios (resúmenes, renovación)
// ---------------------------------------------------------------------------

export interface IngresosServiciosConfig {
  /** Ingreso fijo mensual por resumen/estado de cuenta por cliente (ARS). Ej: 100 */
  ingreso_resumen: number;

  /** Ingreso anual por renovación de tarjeta por cliente (ARS). */
  ingreso_renovacion_anual: number;

  /** Mes a partir del cual se activa el cobro de renovación. Ej: 13 */
  mes_activacion_renovacion: number;
}

// ---------------------------------------------------------------------------
// Parámetros estadísticos (para proyecciones y simulaciones)
// ---------------------------------------------------------------------------

export interface EstadisticasClientesConfig {
  /** Promedio de consumo mensual por cuenta activa (ARS). Ej: 1250 */
  consumo_promedio_cuenta: number;

  /** % de cuentas con consumo sobre el total de tarjetas. Ej: 70 */
  porcentaje_cuentas_con_consumo: number;

  /** % del consumo que se financia en 3 cuotas. Ej: 50 */
  porcentaje_financiacion_3_cuotas: number;

  /** % del consumo que se financia en 6 cuotas. Ej: 30 */
  porcentaje_financiacion_6_cuotas: number;

  /** % del consumo que se financia en 12 cuotas. Ej: 10 */
  porcentaje_financiacion_12_cuotas: number;

  /** % del consumo que corresponde a adelantos de efectivo. Ej: 30 */
  porcentaje_adelantos: number;

  /** % de pago sobre saldos al vencimiento. Ej: 50 */
  porcentaje_pago_saldos: number;
}

// ---------------------------------------------------------------------------
// Config completa del tenant
// ---------------------------------------------------------------------------

export interface FinanceTenantConfig {
  organization_id: string;
  updated_at: string;
  updated_by?: string;

  tasas: TasasConfig;

  /** Planes de cuotas habilitados para esta org (reemplaza tasas.cuotas_X si se usa este array) */
  planes_cuotas: PlanCuotasConfig[];

  comercios: ComerciosConfig;
  mora: MoraConfig;
  ingresos_servicios: IngresosServiciosConfig;
  estadisticas_clientes: EstadisticasClientesConfig;
}

// ---------------------------------------------------------------------------
// Valores default (espejo exacto del modelo Excel)
// ---------------------------------------------------------------------------

export const FINANCE_CONFIG_DEFAULTS: Omit<FinanceTenantConfig, 'organization_id' | 'updated_at' | 'updated_by'> = {
  tasas: {
    financiacion_saldos: 8,
    cuotas_3: 0,
    cuotas_6: 0,
    cuotas_12: 0,
    adelantos: 8,
    costo_fondeo: 3.75,
  },
  planes_cuotas: [
    { cuotas: 3,  tasa_nominal_anual: 0,  label: '3 cuotas',  activo: true },
    { cuotas: 6,  tasa_nominal_anual: 0,  label: '6 cuotas',  activo: true },
    { cuotas: 12, tasa_nominal_anual: 0,  label: '12 cuotas', activo: true },
  ],
  comercios: {
    descuento_comercio: 5,
    tasa_pago_expreso: 8,
    dias_financiacion_promedio: 21,
    dias_pago_expreso: 15,
    porcentaje_pago_expreso: 50,
    arancel_comercios: 100,
  },
  mora: {
    mora_prevista: 10,
    recupero_mora: 30,
    tasa_punitoria: 0,
    dias_gracia: 3,
  },
  ingresos_servicios: {
    ingreso_resumen: 100,
    ingreso_renovacion_anual: 0,
    mes_activacion_renovacion: 13,
  },
  estadisticas_clientes: {
    consumo_promedio_cuenta: 1250,
    porcentaje_cuentas_con_consumo: 70,
    porcentaje_financiacion_3_cuotas: 50,
    porcentaje_financiacion_6_cuotas: 30,
    porcentaje_financiacion_12_cuotas: 10,
    porcentaje_adelantos: 30,
    porcentaje_pago_saldos: 50,
  },
};
