# Don Cándido Finanzas

Core financiero federado dentro del ecosistema Don Cándido.

Este proyecto se usa como base para construir un sistema multi-tenant orientado a:

- venta financiada de electrodomésticos, ferretería y consumo durable
- préstamos personales en distintas modalidades
- cartera, cuotas, cobranzas y mora
- contabilidad automática por doble partida
- integración con eCommerce, CRM y portal cliente

## Enfoque actual

Este repositorio nace federado a partir de `9001app-firebase`. Por eso hoy conviven dos capas:

1. Base heredada del ecosistema
- autenticación
- multi-tenancy
- CRM
- portal cliente
- infraestructura de API
- ledger contable base

2. Núcleo financiero en construcción
- `src/types/finance.ts`
- `src/services/finance/*`
- `src/app/api/finance/*`

La intención no es mantener este proyecto como un clon ISO 9001, sino usar la base técnica existente para evolucionarlo hacia un producto financiero especializado.

## Núcleo financiero implementado

Actualmente ya existe una primera base técnica para:

- generar `prestamos personales`
- generar `ventas financiadas`
- construir plan de cuotas por sistema francés
- registrar movimientos en cuenta corriente del cliente
- registrar recibos e imputaciones
- disparar asientos contables automáticos sobre `journal_entries`

Piezas principales:

- `src/types/finance.ts`
- `src/services/finance/FrenchAmortizationService.ts`
- `src/services/finance/InstallmentPlanService.ts`
- `src/services/finance/CustomerLedgerService.ts`
- `src/services/finance/FinancedSaleService.ts`
- `src/services/finance/PersonalLoanService.ts`
- `src/services/finance/AllocationService.ts`
- `src/services/finance/ReceiptService.ts`

Endpoints actuales:

- `POST /api/finance/financed-sales`
- `GET /api/finance/financed-sales`
- `POST /api/finance/personal-loans`
- `GET /api/finance/personal-loans`
- `POST /api/finance/receipts`
- `GET /api/finance/receipts?receipt_id=...`

## Arquitectura funcional objetivo

El modelo objetivo separa claramente:

### Operaciones origen

- venta financiada
- préstamo personal
- refinanciación

### Motor común

- plan de cuotas
- imputación de cobros
- subledger de clientes
- contabilidad automática

### Integraciones

- CRM comercial
- dealer / catálogo
- portal cliente
- eCommerce

## Multi-tenant

Todas las operaciones financieras deben estar aisladas por `organization_id`.

Regla base:

- ninguna operación financiera debe ejecutarse sin contexto de organización
- el saldo del cliente, cuotas, recibos y asientos siempre pertenecen a un tenant

## Estructura relevante

```txt
src/
  app/
    api/
      finance/
  services/
    finance/
  types/
    finance.ts
reports/
  15_DIAGNOSTICO_DON_CANDIDO_FINANZAS_2026-03-10.md
  16_ESPECIFICACION_CORE_CREDITO_Y_VENTA_FINANCIADA_2026-03-10.md
  17_ESPECIFICACION_TECNICA_CORE_CREDITO_2026-03-10.md
```

## Estado del proyecto

Hoy este repo todavía contiene módulos heredados de ISO, RRHH, procesos y documentación. Eso forma parte de la federación técnica original, pero no define el foco de producto de Don Cándido Finanzas.

El trabajo de desacople se hará por etapas:

1. consolidar núcleo financiero
2. desacoplar navegación y branding
3. separar módulos no financieros
4. dejar integraciones claras con el resto del ecosistema

## Desarrollo

```bash
npm install
npm run dev
```

## Próximos pasos recomendados

- `accounting_rules`
- `payment_intents`
- webhook de pagos
- punitorios / mora
- refinanciación
- vistas operativas de cartera y cuenta corriente
