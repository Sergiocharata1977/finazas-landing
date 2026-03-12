import { withAuth } from '@/lib/api/withAuth';
import { FinanceConfigService } from '@/services/finance/FinanceConfigService';
import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

const READ_ROLES = ['admin', 'gerente', 'jefe', 'auditor', 'operario', 'super_admin'] as const;
const WRITE_ROLES = ['admin', 'gerente', 'super_admin'] as const;

// ---------------------------------------------------------------------------
// Zod schema — valida el body del PUT
// ---------------------------------------------------------------------------
const planCuotasSchema = z.object({
  cuotas: z.number().int().positive(),
  tasa_nominal_anual: z.number().min(0),
  label: z.string().min(1),
  activo: z.boolean(),
});

const configBodySchema = z.object({
  tasas: z.object({
    financiacion_saldos: z.number().min(0),
    cuotas_3: z.number().min(0),
    cuotas_6: z.number().min(0),
    cuotas_12: z.number().min(0),
    adelantos: z.number().min(0),
    costo_fondeo: z.number().min(0),
  }),
  planes_cuotas: z.array(planCuotasSchema).min(1),
  comercios: z.object({
    descuento_comercio: z.number().min(0).max(100),
    tasa_pago_expreso: z.number().min(0),
    dias_financiacion_promedio: z.number().int().min(0),
    dias_pago_expreso: z.number().int().min(0),
    porcentaje_pago_expreso: z.number().min(0).max(100),
    arancel_comercios: z.number().min(0).max(100),
  }),
  mora: z.object({
    mora_prevista: z.number().min(0).max(100),
    recupero_mora: z.number().min(0).max(100),
    tasa_punitoria: z.number().min(0),
    dias_gracia: z.number().int().min(0),
  }),
  ingresos_servicios: z.object({
    ingreso_resumen: z.number().min(0),
    ingreso_renovacion_anual: z.number().min(0),
    mes_activacion_renovacion: z.number().int().positive(),
  }),
  estadisticas_clientes: z.object({
    consumo_promedio_cuenta: z.number().min(0),
    porcentaje_cuentas_con_consumo: z.number().min(0).max(100),
    porcentaje_financiacion_3_cuotas: z.number().min(0).max(100),
    porcentaje_financiacion_6_cuotas: z.number().min(0).max(100),
    porcentaje_financiacion_12_cuotas: z.number().min(0).max(100),
    porcentaje_adelantos: z.number().min(0).max(100),
    porcentaje_pago_saldos: z.number().min(0).max(100),
  }),
});

// ---------------------------------------------------------------------------
// GET /api/finance/config — devuelve la config actual del tenant
// ---------------------------------------------------------------------------
export const GET = withAuth(
  async (_req, _ctx, auth) => {
    const config = await FinanceConfigService.get(auth.organizationId);
    return NextResponse.json({ data: config });
  },
  { roles: [...READ_ROLES] as any }
);

// ---------------------------------------------------------------------------
// PUT /api/finance/config — guarda la config del tenant
// ---------------------------------------------------------------------------
export const PUT = withAuth(
  async (req, _ctx, auth) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }

    let parsed: z.infer<typeof configBodySchema>;
    try {
      parsed = configBodySchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validación fallida', issues: err.issues },
          { status: 422 }
        );
      }
      throw err;
    }

    const saved = await FinanceConfigService.save(
      auth.organizationId,
      parsed,
      auth.uid
    );

    return NextResponse.json({ data: saved });
  },
  { roles: [...WRITE_ROLES] as any }
);
