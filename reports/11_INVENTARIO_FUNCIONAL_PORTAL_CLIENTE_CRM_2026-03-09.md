# Inventario funcional para portal cliente CRM

**Fecha:** 2026-03-09  
**Proyecto:** `9001app-firebase`  
**Agente:** `P1C`

---

## 1. Objetivo

Relevar qué base real existe hoy en `9001app-firebase` para construir un portal cliente ligado a CRM y qué piezas siguen faltando.

Este inventario **no** mezcla:

- datos internos ISO;
- pantallas de backoffice;
- tipados aspiracionales sin persistencia o API pública equivalente.

---

## 2. Resumen ejecutivo

La base actual **no soporta todavía un portal cliente CRM completo**.  
Sí existe una base parcial y útil para arrancar con:

- identidad portal-cliente;
- perfil básico del cliente autenticado;
- resumen comercial básico de compras;
- resumen financiero básico ligado a scoring/crédito;
- catálogo público de productos;
- seguimiento autenticado de solicitudes dealer, incluyendo solicitudes de servicio.

Lo que **no** existe todavía como capacidad lista para portal:

- compras detalladas por cliente;
- maquinaria del cliente como entidad operativa propia;
- mantenimientos del cliente;
- alertas de mantenimiento del cliente;
- cuenta corriente operativa con movimientos, saldo, vencimientos y comprobantes.

---

## 3. Base transversal existente

### 3.1 Identidad portal-cliente

**Estado:** `parcial`

Ya existe una identidad explícita `portal_customer_identities` con vínculo:

- `firebase_uid`
- `organization_id`
- `crm_organizacion_id`
- `crm_contacto_id`
- `allowed_scopes`

Evidencia:

- `src/types/portal-customer-identity.ts`
- `src/lib/public/resolvePortalCustomerIdentity.ts`
- `src/app/api/public/cliente/me/route.ts`

Conclusión:

- ya no es cierto que el sistema dependa sólo de email para toda la identidad portal;
- el portal público autenticado ya expone `GET /api/public/cliente/me` y subrutas para compras, servicios, mantenimientos y cuenta corriente;
- pero no todas esas rutas tienen detrás una base operativa real del mismo nivel.

### 3.2 APIs públicas reales hoy disponibles

**Disponibles hoy:**

- `GET /api/public/org/[slug]`
- `GET /api/public/productos`
- `POST /api/public/solicitudes`
- `GET /api/public/solicitudes/mias`
- `GET /api/public/cliente/me`
- `GET /api/public/cliente/me/compras`
- `GET /api/public/cliente/me/servicios`
- `GET /api/public/cliente/me/mantenimientos`
- `GET /api/public/cliente/me/cuenta-corriente`

Conclusión:

- la superficie pública actual cubre branding, catálogo, ingreso de solicitudes, seguimiento de solicitudes, perfil básico y resúmenes parciales de compras/crédito;
- la existencia de ruta no implica que el bloque ya tenga modelo operativo completo para portal.

### 3.3 Riesgo de consistencia en CRM

Hay una inconsistencia técnica que conviene dejar explícita:

- `src/services/crm/ClienteCRMService.ts` opera sobre `clientes_crm`;
- `src/app/api/crm/clientes/*.ts`, `HistoricoService` y `SolicitudCRMBridgeService` operan sobre `crm_organizaciones`.

Conclusión:

- para el portal cliente hay que tomar como base real la rama que hoy usa `crm_organizaciones` y APIs;
- no conviene asumir que ambos modelos están unificados.

---

## 4. Inventario por bloque funcional

| Bloque | Estado | Qué existe hoy | Qué falta para portal cliente |
|---|---|---|---|
| Maquinaria | `parcial` | Tipos patrimoniales en legajo fiscal, snapshots patrimoniales y referencias de máquina dentro de solicitudes dealer | Entidad operativa de maquinaria del cliente, vínculo estable con CRM, API pública autenticada y separación entre patrimonio fiscal vs parque de máquinas visible al cliente |
| Compras | `parcial` | Métricas agregadas en CRM y endpoint autenticado que arma listado desde oportunidades ganadas | Historial detallado de compras, facturas, ítems, estados, fechas y documentos comerciales reales |
| Mantenimientos | `faltante` | Existe mantenimiento ISO de activos internos, no de activos del cliente | Modelo de mantenimiento de maquinaria del cliente, historial, responsables, próximas intervenciones y API pública |
| Servicios | `disponible` | Solicitudes dealer de tipo `servicio` con alta pública y consulta autenticada en `solicitudes/mias` y `/api/public/cliente/me/servicios` | Si se quiere algo más que tickets: ordenes de trabajo, diagnóstico, cierre técnico, repuestos usados, adjuntos |
| Alertas de mantenimiento | `faltante` | Scope y ruta reservada de mantenimientos, pero sin colección cliente+máquina ni alertas reales | Reglas de alerta para maquinaria del cliente, notificaciones y backend real de vencimientos |
| Cuenta corriente | `parcial` | Endpoint autenticado que sintetiza scoring, límite y estados financieros desde CRM | Movimientos reales, saldos, vencimientos, pagos, comprobantes y cobranzas como cuenta corriente operativa |

---

## 5. Hallazgos detallados por bloque

### 5.1 Maquinaria

**Clasificación:** `parcial`

Base encontrada:

- `src/types/crm-fiscal.ts` modela `Maquinaria[]` dentro de `LegajoFiscal`.
- `src/services/crm/LegajoFiscalService.ts` permite crear legajo y agregar maquinarias.
- `src/types/crm-historico.ts` y `src/services/crm/HistoricoService.ts` permiten snapshots patrimoniales con maquinarias.
- `src/app/api/crm/historico/[clienteId]/patrimonio/route.ts` expone histórico patrimonial interno autenticado.
- `src/app/api/public/solicitudes/mias/route.ts` devuelve `maquina_tipo`, `modelo` y `numero_serie` para solicitudes.
- `src/types/dealer-catalogo.ts` y `src/app/api/public/productos/route.ts` permiten catálogo público de productos categoría `maquinaria`.

Lectura correcta:

- sí hay datos vinculados a maquinaria;
- pero hoy están repartidos entre patrimonio fiscal, catálogo de productos y payload de solicitudes;
- eso **no equivale** a una entidad consolidada de “maquinaria propia del cliente” apta para portal.

Lo que puede construirse ya:

- una vista acotada de máquinas mencionadas en solicitudes de servicio/repuestos;
- eventualmente una vista patrimonial interna, pero **no es recomendable exponerla al cliente** como si fuera su parque operativo.

Lo que falta:

- colección específica de maquinaria del cliente;
- relación estable `crm_cliente -> maquinaria[]`;
- atributos operativos: estado, horas, serie validada, fecha de compra/entrega, mantenimientos, alertas;
- API pública autenticada.

### 5.2 Compras

**Clasificación:** `parcial`

Base encontrada:

- `src/types/crm.ts` define en `ClienteCRM`:
  - `fecha_primera_compra`
  - `fecha_ultima_compra`
  - `total_compras_12m`
  - `cantidad_compras_12m`
  - `monto_total_compras_historico`
- `src/services/crm/ClienteCRMService.ts` incluye `registrarCompra()` que sólo actualiza acumulados.
- `src/services/crm/OportunidadesService.ts` lista oportunidades por `crm_organizacion_id`.
- `src/app/api/public/cliente/me/compras/route.ts` expone compras autenticadas armadas desde oportunidades `resultado = ganada`.

Lectura correcta:

- existe resumen comercial agregado;
- existe una vista pública parcial de compras basada en oportunidades ganadas;
- no existe un libro de compras por cliente.

Lo que puede construirse ya:

- cards o widgets con indicadores de compras acumuladas;
- listado simple de oportunidades ganadas como proxy comercial de compras;
- resumen simple de última compra y monto histórico si esos campos están cargados.

Lo que falta:

- colección de compras/facturas/pedidos por cliente;
- detalle por comprobante;
- productos comprados;
- estados y fechas de entrega;
- documentos descargables;
- API pública autenticada de compras con respaldo documental real.

### 5.3 Mantenimientos

**Clasificación:** `faltante`

Base encontrada:

- `src/types/iso-infrastructure.ts`
- `src/app/api/iso-infrastructure/route.ts`
- `src/app/api/iso-infrastructure/[id]/maintenance/route.ts`

Lectura correcta:

- el sistema sí tiene un módulo de activos y mantenimientos;
- pero pertenece a `infrastructure_assets` internos de la organización;
- no representa mantenimientos de maquinaria del cliente.

Conclusión:

- por restricción de alcance, esto **no debe contarse** como base válida para el portal cliente CRM.

Lo que falta:

- modelo de mantenimiento sobre maquinaria del cliente;
- historial por máquina;
- tipo de intervención;
- resultado/cierre;
- próximos mantenimientos;
- acceso público autenticado por cliente.

### 5.4 Servicios

**Clasificación:** `disponible`

Base encontrada:

- `src/types/solicitudes.ts` soporta `tipo: 'servicio'`.
- `src/app/api/public/solicitudes/route.ts` permite alta pública de solicitudes de servicio.
- `src/services/solicitudes/SolicitudService.ts` persiste solicitudes.
- `src/app/api/public/cliente/me/servicios/route.ts` expone ese subconjunto para portal autenticado.
- `src/app/api/public/solicitudes/mias/route.ts` lista solicitudes autenticadas por cliente con:
  - `estado`
  - `maquina_tipo`
  - `modelo`
  - `numero_serie`
  - `descripcion_problema`
  - `localidad`
  - `provincia`

Lectura correcta:

- ya puede construirse un bloque de “Mis servicios / Mis solicitudes técnicas”;
- el alcance real es seguimiento de tickets/solicitudes, no gestión posventa completa.

Lo que puede construirse ya:

- listado autenticado de solicitudes de servicio del cliente;
- detalle básico por estado y datos de máquina reportada.

Lo que falta si se quisiera ir más allá:

- orden de trabajo;
- técnico asignado;
- diagnóstico;
- repuestos utilizados;
- fecha de visita/cierre;
- archivos y evidencias técnicas.

### 5.5 Alertas de mantenimiento

**Clasificación:** `faltante`

Base encontrada:

- `nextMaintenanceDate` existe sólo en `InfraAsset` interno.
- no hay reglas ni colecciones de alertas ligadas a maquinaria del cliente.
- `src/types/portal-customer-identity.ts` ya enumera el scope `mantenimientos`.
- `src/app/api/public/cliente/me/mantenimientos/route.ts` existe, pero devuelve `items: []` y `fuente: pendiente_integracion`.

Lectura correcta:

- hoy hay contrato público reservado e intención de producto, no capacidad funcional lista.

Lo que falta:

- base de maquinaria cliente;
- calendario de mantenimiento por máquina;
- motor de alertas o al menos cálculo de vencimientos;
- canal de notificación;
- backend real detrás de la API pública autenticada reservada.

### 5.6 Cuenta corriente

**Clasificación:** `parcial`

Base encontrada:

- `src/types/crm.ts` modela:
  - `LineaCredito`
  - `OperacionCredito`
  - `linea_credito_vigente_id`
  - `limite_credito_actual`
- `src/services/crm/EvaluacionRiesgoService.ts` crea evaluaciones y permite aprobar límite.
- `src/services/crm/EstadosFinancierosService.ts` expone situación patrimonial y estado de resultados por cliente.
- `src/lib/public/portalCustomer.ts` arma `buildCuentaCorrientePayload(...)` a partir de cliente, evaluación y estados financieros.
- `src/app/api/public/cliente/me/cuenta-corriente/route.ts` expone ese resumen autenticado.
- `src/components/crm/CreditoScoringTab.tsx` muestra evaluación vigente, score e límite asignado.
- `src/app/api/crm/evaluaciones/route.ts` expone evaluaciones internas autenticadas.
- `src/app/crm/clientes/[id]/page.tsx` tiene tabs “Cobranzas” y “Facturas”, pero hoy sólo muestran datos básicos o adjuntos, no cuenta corriente real.

Lectura correcta:

- existe base para riesgo y cupo de crédito;
- existe un resumen autenticado de perfil crediticio/financiero;
- no existe cuenta corriente operativa de cliente.

Lo que puede construirse ya:

- bloque de “Crédito disponible / scoring / categoría de riesgo” si el cliente tiene evaluación cargada;
- resumen de situación patrimonial y resultado del ejercicio si existen estados cargados;
- perfil financiero resumido, no cuenta corriente.

Lo que falta:

- saldo actual;
- movimientos débito/crédito;
- vencimientos;
- pagos imputados;
- facturas;
- recibos;
- alertas de mora;
- libro de cuenta corriente real, aunque hoy ya exista una ruta pública de resumen.

---

## 6. Qué UI del portal puede construirse ya

### Construible ahora sin inventar backend

- Perfil del cliente autenticado:
  - usando `GET /api/public/cliente/me`
- Catálogo público:
  - usando `GET /api/public/productos`
- Mis solicitudes:
  - usando `GET /api/public/solicitudes/mias`
- Mis servicios:
  - usando `GET /api/public/cliente/me/servicios`
- Mis compras resumidas:
  - usando `GET /api/public/cliente/me/compras`
  - entendiendo que hoy son oportunidades ganadas, no facturas/pedidos
- Resumen financiero acotado:
  - usando `GET /api/public/cliente/me`
  - o `GET /api/public/cliente/me/cuenta-corriente`
  - entendiendo que hoy es perfil crediticio, no cuenta corriente operativa

### No construible todavía con base real suficiente

- Mis compras detalladas por comprobante
- Mi maquinaria consolidada
- Mis mantenimientos
- Alertas de mantenimiento
- Cuenta corriente completa

---

## 7. Recomendación de secuencia

Orden mínimo razonable antes de prometer un portal cliente CRM completo:

1. Consolidar identidad portal-cliente como base oficial.
2. Exponer APIs públicas autenticadas por bloque real:
   - maquinaria
   - mantenimientos
   - alertas
3. Modelar maquinaria del cliente como entidad propia.
4. Modelar mantenimientos y alertas sobre esa maquinaria.
5. Modelar compras y cuenta corriente con colecciones reales, no sólo acumulados.

---

## 8. Conclusión corta por bloque

- **Maquinaria:** `parcial` porque hay datos dispersos, pero no una entidad cliente apta para portal.
- **Compras:** `parcial` porque hay acumulados CRM y un endpoint resumido basado en oportunidades ganadas, no historial detallado.
- **Mantenimientos:** `faltante` porque el mantenimiento existente es interno ISO.
- **Servicios:** `disponible` para seguimiento de solicitudes técnicas, no para posventa completa.
- **Alertas de mantenimiento:** `faltante`, aunque ya exista una ruta reservada sin backend real.
- **Cuenta corriente:** `parcial` porque existe resumen crediticio/financiero autenticado, pero no movimientos ni saldo operativo.

La conclusión práctica es simple: **el portal cliente real hoy puede arrancar por perfil + solicitudes + servicios, y también por resúmenes parciales de compras/crédito; pero no por maquinaria propia, mantenimientos, alertas ni cuenta corriente operativa sin modelado adicional.**
