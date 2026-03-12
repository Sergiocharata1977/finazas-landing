# Diagnóstico Técnico-Funcional de Don Cándido Finanzas

Fecha: 2026-03-10
Repositorio analizado: `9001app-firebase`
Alcance: estado actual del sistema, comparación contra modelo ideal para retail de electrodomésticos con crédito propio, y propuesta de evolución.

## 1. Resumen ejecutivo

El repositorio no contiene hoy un sistema financiero integral para una empresa de electrodomésticos que vende, financia, cobra y contabiliza en forma automática. Lo que sí existe es una base parcial y reutilizable compuesta por:

- CRM multi-tenant con clientes, contactos, oportunidades y acciones.
- Catálogo dealer de productos.
- Subflujo operativo de gestión crediticia.
- Motor mínimo de asientos contables manuales.
- Portal público de cliente con vista resumida de “cuenta corriente”.

Diagnóstico general:

- Madurez comercial/CRM: media.
- Madurez de análisis crediticio: media.
- Madurez de financiación, cobranzas y cartera: baja a inexistente.
- Madurez contable: baja.
- Madurez de automatización contable: inexistente como capacidad de negocio end-to-end.

Conclusión inicial: Don Cándido Finanzas hoy está lejos del modelo ideal. Puede evolucionar hacia ese modelo, pero no mediante pequeños ajustes cosméticos. Requiere consolidar dominio de datos, crear un núcleo transaccional financiero y conectar ese núcleo con un motor contable parametrizable.

## 2. Mapa del sistema actual

### 2.1 Módulos y capacidades detectadas

1. CRM base

- Clientes/organizaciones CRM.
- Contactos CRM.
- Oportunidades CRM.
- Acciones CRM.
- Estados Kanban y vistas comerciales.

Evidencia:

- `src/app/api/crm/clientes/route.ts`
- `src/services/crm/ClienteCRMServiceAdmin.ts`
- `src/services/crm/OportunidadesService.ts`
- `src/types/crm.ts`
- `src/types/crm-contacto.ts`
- `src/types/crm-oportunidad.ts`

2. Gestión crediticia

- Workflow crediticio por oportunidad.
- Evaluación de riesgo con scoring cualitativo, conflictos y cuantitativos.
- Configuración de scoring por organización.
- Cierre automático del workflow al aprobar/rechazar evaluación.

Evidencia:

- `src/app/(dashboard)/gestion-crediticia/page.tsx`
- `src/app/api/crm/credit-workflows/route.ts`
- `src/services/crm/CreditWorkflowService.ts`
- `src/services/crm/EvaluacionRiesgoService.ts`
- `src/types/crm-credit-workflow.ts`
- `src/types/crm-evaluacion-riesgo.ts`

3. Catálogo dealer / originación comercial

- Catálogo de productos por organización.
- Publicación pública del catálogo.
- Solicitudes públicas dealer integradas a CRM.

Evidencia:

- `src/services/dealer/ProductoDealerService.ts`
- `src/app/api/dealer/productos/route.ts`
- `src/app/api/public/productos/route.ts`
- `src/services/solicitudes/SolicitudCRMBridgeService.ts`

4. Portal público de cliente

- Perfil del cliente.
- Solicitudes.
- Resumen de compras.
- Vista de “cuenta corriente” resumida.

Evidencia:

- `src/app/api/public/cliente/me/route.ts`
- `src/app/api/public/cliente/me/cuenta-corriente/route.ts`
- `src/lib/public/portalCustomer.ts`

5. Contabilidad mínima

- Endpoint para registrar asientos.
- Validación de doble partida.
- Idempotencia básica.
- DLQ de errores.

Evidencia:

- `src/app/api/accounting/journal-entries/route.ts`
- `src/lib/accounting/CoreLedgerService.ts`
- `src/lib/accounting/types.ts`

### 2.2 Entidades detectadas

Entidades reales o inferibles desde colecciones/tipos/rutas:

- `crm_organizaciones`
- `crm_contactos`
- `crm_oportunidades`
- `crm_credit_workflows`
- `crm_evaluaciones_riesgo`
- `crm_config_scoring`
- `solicitudes`
- `organizations/{orgId}/productos`
- `journal_entries`
- `journal_entries_dlq`

Entidades sugeridas por tipos pero no materializadas como módulo operativo robusto:

- línea de crédito
- operaciones de crédito
- facturas
- cobranzas
- cuotas
- recibos
- mora
- refinanciaciones
- plan de cuentas
- subledger de clientes

### 2.3 Relaciones detectadas

- Cliente CRM (`crm_organizaciones`) <-> Contactos CRM (`crm_contactos`)
- Cliente CRM <-> Oportunidades (`crm_oportunidades`)
- Oportunidad <-> Workflow crediticio (`crm_credit_workflows`)
- Workflow crediticio <-> Evaluación de riesgo (`crm_evaluaciones_riesgo`)
- Solicitud pública/dealer <-> Cliente CRM / Contacto / Oportunidad
- Cliente CRM <-> Portal cliente
- Asiento contable (`journal_entries`) <-> `source_module` / `source_type` / `source_id`

### 2.4 Flujos operativos actuales detectados

Flujo comercial evidenciado:

1. Captación pública o alta interna.
2. Creación/actualización de cliente CRM.
3. Creación de contacto.
4. Creación de oportunidad.
5. Movimiento por Kanban.
6. Si el estado requiere crédito, se dispara workflow crediticio.
7. El analista crea evaluación.
8. La evaluación puede aprobarse o rechazarse.
9. El workflow se actualiza y se cierra.

Flujo contable real detectado:

1. Un cliente autenticado POSTea a `/api/accounting/journal-entries`.
2. `CoreLedgerService` valida equilibrio débito/crédito.
3. Se persiste un asiento en `journal_entries`.

No se detectó un flujo automático donde una venta, cuota o cobro genere asientos contables de forma nativa.

### 2.5 Componentes reutilizables

- Modelo multi-tenant por `organization_id`.
- Enrutado API protegido con `withAuth`.
- Servicios Admin SDK.
- Trazabilidad por timestamps y estados.
- Bridge de solicitudes hacia CRM.
- Validación e idempotencia del ledger.
- Portal público de cliente ya resuelto para scopes y vinculación.

## 3. Evaluación por dimensión

| Dimensión | Nivel | Diagnóstico |
|---|---|---|
| Ventas | Medio | Existe CRM, oportunidades y catálogo. No hay ciclo formal de venta con pedido, comprobante, entrega y facturación. |
| Crédito | Medio | Existe scoring, evaluación, workflow y límite asignado. Falta expediente completo, comité formal, garantías estructuradas y política integral. |
| Financiación | Inexistente | No se detectaron planes de pago, cuotas, cronogramas, intereses, refinanciación ni cartera viva. |
| Cobranza | Bajo | La UI menciona cobranzas, pero no hay submódulo transaccional de pagos, recibos o imputación a cuotas. |
| Contabilidad | Bajo | Existe un ledger de asientos manuales balanceados, pero no un sistema contable funcional completo. |
| Automatización contable | Inexistente | No se detectan reglas contables por formulario ni generación automática desde operaciones comerciales/financieras. |
| Trazabilidad | Medio | CRM y crédito tienen buen rastro de estados y vínculos. Falta trazabilidad financiera-documental-contable integrada. |
| Reportes | Bajo | Hay vistas operativas y métricas parciales. No hay reportes financieros, contables ni de cartera. |
| Experiencia de usuario | Medio | Hay pantallas operativas útiles para CRM/crédito. En finanzas hay señales de UX de diseño, no de producto terminado. |
| Escalabilidad | Medio | La base multi-tenant es correcta, pero el dominio financiero aún no está modelado. |

## 4. Comparación contra el sistema ideal

### 4.1 Clientes y legajos

- Existe hoy: clientes CRM, contactos, datos básicos, notas, documentos adjuntos simples.
- Parcial: identidad financiera y vista de cuenta corriente resumida.
- Falta: legajo crediticio integral, garantías, documentos obligatorios, historial financiero estructurado, segmentación retail/B2C.
- Reutilizable: `crm_organizaciones`, `crm_contactos`, portal cliente.

### 4.2 Catálogo de productos y condiciones comerciales

- Existe hoy: catálogo dealer por organización con precios contado/lista y stock simple.
- Falta: listas de precio versionadas, condiciones por canal, promociones, combos, financiación por producto.
- Reutilizable: `organizations/{orgId}/productos`, API pública de catálogo.

### 4.3 Ventas

- Existe hoy: oportunidades comerciales.
- Parcial: originación desde solicitudes dealer.
- Falta: pedido, reserva, entrega, remito, factura, nota de crédito, cierre de venta financiada.
- Reutilizable: oportunidad comercial como etapa previa a la venta.

### 4.4 Crédito y scoring

- Existe hoy: scoring configurable, evaluación de riesgo, tier sugerido/asignado, límite de crédito asignado, workflow operativo.
- Parcial: vínculo con oportunidad y proyección de resolución.
- Falta: políticas de excepción, garantías formales, vigencia normativa, revisión periódica automatizada, expediente documental robusto.
- Reutilizable: `crm_evaluaciones_riesgo`, `crm_credit_workflows`, `crm_config_scoring`.

### 4.5 Financiación / préstamos / cuotas

- Existe hoy: no evidenciado.
- Falta: operación financiera originaria, saldo financiado, plan de cuotas, cronograma, capital/interés, punitorios, refinanciación, cancelación anticipada, ageing de cartera.
- Reutilizable: límite de crédito actual y contexto del cliente.

### 4.6 Cobranzas

- Existe hoy: no evidenciado como módulo transaccional.
- Parcial: pestaña “Cobranzas” en UI y resumen público de cuenta corriente.
- Falta: registro de pago, imputación, parcialidades, recibos, conciliación, gestión de mora, promesas de pago, recupero.
- Reutilizable: portal cliente, timeline CRM, eventuales integraciones de pago.

### 4.7 Caja y bancos

- Existe hoy: no evidenciado.
- Falta: caja diaria, movimientos bancarios, medios de cobro, conciliación, arqueo.
- Reutilizable: endpoint contable y posible integración con billing/Mobbex.

### 4.8 Contabilidad automática de doble partida

- Existe hoy: motor genérico de asientos con validación de balance.
- Parcial: doble partida técnica a nivel asiento.
- Falta: plan de cuentas, parametrización por tipo de operación, diarios, mayor, submayores, cierres, reversiones, periodificación, impuestos.
- Reutilizable: `CoreLedgerService`.

### 4.9 Plan de cuentas configurable

- Existe hoy: no evidenciado.
- Falta total: maestro de cuentas, naturaleza, jerarquía, cuentas por organización, cuentas por operación.

### 4.10 Reglas contables por tipo de operación

- Existe hoy: no evidenciado.
- Falta total: mapping venta/cobro/refinanciación/incobrable -> asiento contable.

### 4.11 Reportes gerenciales y contables

- Existe hoy: métricas parciales de CRM.
- Falta: mora, cartera, originación, recupero, rentabilidad financiera, balance, mayor, diario, cuentas corrientes reales.

### 4.12 Auditoría y trazabilidad

- Existe hoy: timestamps, estados, relación solicitud-CRM-oportunidad-crédito, audit logs generales.
- Falta: encadenamiento documental integral venta -> financiamiento -> cuota -> cobro -> asiento.

## 5. Brechas críticas

1. Ausencia de dominio financiero transaccional

- No hay entidades de préstamo, venta financiada, plan de pagos, cuota, cobro ni recibo.

2. Ausencia de subledger de clientes

- La “cuenta corriente” actual es una vista derivada de CRM y evaluaciones, no un mayor auxiliar de movimientos.

3. Ausencia de contabilidad parametrizada

- El ledger actual registra asientos, pero no sabe qué cuentas usar según el tipo de operación.

4. No existe plan de cuentas

- Sin plan de cuentas configurable no se puede hablar de contabilidad operativa robusta.

5. Sin integración venta-financiación-contabilidad

- Oportunidad y scoring terminan antes del hecho económico real.

6. Cobranzas no implementadas

- No hay aplicación de pagos a deuda ni lifecycle de mora.

7. Inconsistencia de modelo de datos CRM

- Conviven `clientes_crm` y `crm_organizaciones`, además de `kanban_estados` y `crm_kanban_estados`.
- Esto indica deuda técnica y riesgo de duplicidad/deriva semántica.

8. Seguridad de Firestore no explicita dominio financiero

- `firestore.rules` no define reglas específicas para colecciones financieras/contables relevantes.
- Esto sugiere que el dominio aún depende del backend o no está incorporado de forma madura.

## 6. Riesgos del estado actual

### 6.1 Funcionales

- Se puede confundir “gestión crediticia” con “finanzas” cuando en realidad sólo cubre originación/evaluación.
- La UI de cobranzas/deudas puede generar falsa sensación de capacidad operativa no respaldada por datos reales.

### 6.2 Contables

- Alto riesgo de registración incompleta o manual ad hoc.
- Sin reglas contables ni plan de cuentas, cada integración futura podría registrar distinto.

### 6.3 Operativos

- No existe cartera de cuotas ni mecanismo de seguimiento de vencimientos financieros.
- No hay base para recupero, refinanciación o incobrables.

### 6.4 Técnicos

- Deuda de modelos duplicados: `clientes_crm` vs `crm_organizaciones`, `kanban_estados` vs `crm_kanban_estados`.
- Riesgo de lógica repartida entre servicios legacy y servicios admin.

### 6.5 Escalabilidad

- El crecimiento de operaciones financieras sin un núcleo dedicado derivaría en acoplamientos frágiles con CRM.

### 6.6 Consistencia de datos

- El mismo cliente puede tener proyecciones comerciales, scoring y resúmenes públicos sin un libro auxiliar financiero que actúe como fuente única.

### 6.7 Auditoría

- Falta trazabilidad formal desde documento comercial a asiento contable y a saldo de cliente.

## 7. Arquitectura funcional ideal propuesta

### 7.1 Decisión de arquitectura

El módulo financiero-contable debería ser un núcleo propio dentro del ecosistema, no un plugin superficial del CRM. Debe integrarse con CRM, dealer y portal cliente, pero mantener su propio dominio transaccional.

### 7.2 Módulos objetivo

1. Maestros

- clientes financieros
- contactos
- productos
- listas de precios
- condiciones de financiación
- plan de cuentas
- parámetros contables por organización

2. Comercial

- presupuesto
- pedido
- venta
- entrega/remito
- comprobante

3. Crédito

- solicitud de crédito
- expediente
- scoring
- comité
- línea/límite de crédito
- garantías

4. Financiación

- operación financiada
- plan de cuotas
- detalle cuota
- intereses
- seguros/cargos
- refinanciación
- cancelación anticipada

5. Cobranzas

- recibo
- medios de cobro
- imputación a cuotas
- parcialidades
- promesas de pago
- mora
- recupero

6. Caja y bancos

- caja diaria
- movimientos bancarios
- conciliación

7. Contabilidad

- plan de cuentas
- reglas contables
- diario
- mayor
- subledger clientes
- asientos automáticos
- reversiones
- cierres

8. Reportes

- originación
- colocación
- cartera activa
- mora por antigüedad
- recupero
- estado de cuenta
- balance y mayor

### 7.3 Entidades principales objetivo

- `financial_customers`
- `sales_orders`
- `sales_contracts`
- `credit_applications`
- `credit_lines`
- `loan_accounts`
- `installment_plans`
- `installments`
- `receipts`
- `receipt_allocations`
- `delinquency_cases`
- `refinancing_operations`
- `chart_of_accounts`
- `accounting_rules`
- `journal_entries`
- `journal_entry_lines`
- `customer_ledger_entries`

### 7.4 Flujo ideal entre formularios y asientos

Formulario: venta financiada

- genera venta/contrato
- genera cuenta por cobrar financiera
- genera plan de cuotas
- dispara asiento automático

Ejemplo contable esperado:

- Debe: créditos por ventas / cuentas por cobrar financiadas
- Haber: ventas
- Haber/Debe adicional: IVA, descuentos, anticipo, stock/costo si aplica

Formulario: cobro de cuota

- registra recibo
- imputa a una o más cuotas
- separa capital/interés/punitorio
- actualiza saldo del cliente
- dispara asiento automático

Formulario: refinanciación

- cierra deuda anterior
- crea nuevo plan
- reexpresa saldo y vencimientos
- dispara asiento de reclasificación/nueva financiación

Formulario: incobrable

- reclasifica cartera
- registra previsión o castigo
- deja trazabilidad documental y aprobación

### 7.5 Reglas contables

Cada formulario debe apuntar a un `operation_type` parametrizable:

- `sale_cash`
- `sale_financed`
- `down_payment`
- `installment_collection`
- `late_fee_accrual`
- `refinancing`
- `write_off`
- `bank_movement`
- `expense`

Cada `operation_type` debe resolver:

- cuentas debe/haber
- condiciones por organización
- centro de costo opcional
- segmentación capital/interés/impuestos
- políticas de reversión

## 8. Recomendaciones de evolución

### Corto plazo

1. Consolidar modelo CRM

- Definir una sola entidad maestra de cliente CRM/financiero.
- Eliminar ambigüedad entre `clientes_crm` y `crm_organizaciones`.

2. Formalizar frontera de producto

- Separar explícitamente “CRM y riesgo” de “núcleo financiero”.
- Evitar vender internamente la UI actual como sistema de cobranzas/finanzas.

3. Endurecer el ledger existente

- Crear líneas tipadas persistentes.
- Agregar reversión.
- Agregar validaciones de período, moneda y referencia fuente.

4. Crear plan de cuentas y reglas contables

- Aunque todavía no existan ventas/cuotas, hay que diseñar primero la capa parametrizable.

### Mediano plazo

1. Crear submódulo de ventas financiadas

- contrato/operación
- anticipo
- saldo financiado
- plan de cuotas

2. Crear subledger de clientes

- movimientos débito/crédito por cliente
- saldo
- estado de cuenta real

3. Crear cobranzas

- recibos
- imputación
- medios de pago
- mora básica

4. Conectar operaciones con asientos automáticos

- no permitir que la contabilidad dependa de carga manual para operaciones estándar

### Largo plazo

1. Refinanciaciones e incobrables
2. Caja y bancos
3. Reportes gerenciales y contables avanzados
4. Integración con pagos externos y conciliación
5. Cierre contable y reporting fiscal

## 9. Roadmap sugerido

### Fase 1. Base maestra y saneamiento

- unificar cliente CRM
- unificar estados Kanban
- definir modelo financiero
- definir plan de cuentas
- definir catálogo de reglas contables

### Fase 2. Operación comercial financiada

- venta financiada
- anticipo
- contrato
- plan de cuotas
- saldo inicial de cliente

### Fase 3. Cobranzas

- recibos
- imputación
- cobranzas parciales
- vencimientos y mora inicial

### Fase 4. Contabilidad automática

- asientos por venta financiada
- asientos por cobro
- asientos por refinanciación
- libro diario y mayor

### Fase 5. Cartera y recupero

- aging
- promesas de pago
- refinanciaciones
- incobrables

### Fase 6. Reportes y cierre

- reportes de cartera
- cuenta corriente real
- balance y mayor
- cierre mensual

## 10. Veredicto final

Sí, Don Cándido Finanzas puede evolucionar al modelo ideal, pero hoy todavía no es ese sistema.

Piezas que ya sirven:

- CRM multi-tenant.
- Gestión de oportunidades.
- Workflow crediticio.
- Evaluación de riesgo y scoring.
- Catálogo dealer.
- Portal cliente.
- Ledger mínimo con validación de doble partida.

Piezas que conviene rehacer o rediseñar:

- dominio de cliente si se quiere convergencia real CRM/finanzas
- capa de cobranzas
- capa de financiación/cuotas
- cuenta corriente
- contabilidad funcional
- parametrización de cuentas

Estrategia más razonable:

1. Consolidar datos y límites de responsabilidad de cada módulo.
2. Construir un núcleo financiero transaccional propio.
3. Usar el CRM actual como capa de originación y relación comercial.
4. Usar el ledger actual solo como base técnica, no como solución contable terminada.
5. Recién después conectar formularios operativos con reglas contables automáticas.

## Anexo A. Hallazgos concretos de ingeniería

### A.1 Señales positivas

- `CoreLedgerService` valida asientos balanceados e idempotencia.
- `EvaluacionRiesgoService` y `CreditWorkflowService` ya coordinan estado de evaluación y workflow.
- `SolicitudCRMBridgeService` demuestra capacidad de orquestar módulos y crear entidades relacionadas.
- El portal público ya maneja scopes e identidad de cliente.

### A.2 Señales de deuda técnica

- `ClienteCRMService.ts` usa `clientes_crm`, mientras la API admin usa `crm_organizaciones`.
- `KanbanService.ts` usa `kanban_estados`, mientras el flujo actual usa `crm_kanban_estados`.
- La pantalla de cliente muestra “Resumen de deudas”, “Cobranzas” y “Facturas”, pero sin backend financiero dedicado.
- No se detectaron rutas productivas bajo `/finanzas/*`; sólo referencias en el design system.

### A.3 Inferencia final

La base actual es la de un CRM con scoring y pre-finanzas, no la de un ERP financiero-contable especializado. El proyecto tiene buenos bloques reutilizables para llegar a ese objetivo, pero todavía carece del dominio central que convierte la aprobación de crédito en cartera administrable y contabilizada.
