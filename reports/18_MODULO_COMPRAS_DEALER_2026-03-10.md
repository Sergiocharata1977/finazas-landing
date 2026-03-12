# Módulo: Compras Dealer — Planificación e Implementación
**Reporte 18 | Fecha: 2026-03-10 | Estado: PLANIFICADO**

---

## 1. Resumen ejecutivo

Diseño e implementación del módulo de **Proceso de Compras** para la plataforma Don Cándido IA, orientado a empresas concesionarias y de servicios de maquinaria agrícola (Agro Biciufa como tenant de referencia).

Se registra como **Capability Plugin** bajo el ID `dealer_compras`, dentro de la familia de plugins Dealer. Puede activarse en cualquier tenant del mismo rubro sin reescribir código.

El módulo cubre el ciclo completo desde la necesidad interna hasta la recepción y cierre, con Kanban visual de estados, trazabilidad por item, vinculación con otros procesos y alineación con ISO 9001:2015 cláusula 8.4 (Control de productos y servicios externos).

---

## 2. Alcance del plugin `dealer_compras`

### Lo que incluye este módulo
- Solicitud interna de compra con prioridad y tipo
- Flujo de aprobación con cambio de estados
- Asociación con proveedor (libre o del maestro)
- Orden de compra con ítems, cantidades, precios estimados
- Recepción parcial o total
- Registro de incidencias (desvíos, rechazos)
- Kanban visual por estado
- Métricas básicas de desempeño
- Vinculación opcional con: órdenes de servicio, hallazgos, oportunidades CRM

### Lo que NO incluye (pero queda previsto como integración futura)
- Stock / inventario automático
- Contabilidad y cuentas a pagar
- Maestro de proveedores avanzado (módulo separado)
- Evaluación periódica de proveedores (módulo calidad)
- Notificaciones WhatsApp / email
- Aprobación multinivel configurable (Fase 3)

---

## 3. Tipos de compra soportados

| Tipo | Descripción | Ejemplo Agro Biciufa |
|------|-------------|----------------------|
| `repuesto` | Repuesto de máquina | Filtros, correas, retenes CASE |
| `insumo` | Insumo de taller | Aceite, grasa, gas |
| `servicio_externo` | Servicio tercerizado | Rectificado, soldadura, flete |
| `herramienta` | Herramienta o equipo | Llave de impacto, multímetro |
| `consumible` | Consumible administrativo | Papelería, EPP |
| `logistica` | Transporte/flete | Traslado de máquina al campo |
| `otro` | No clasificado | — |

---

## 4. Máquina de estados

```
borrador → solicitada → aprobada → orden_emitida → recibida → cerrada
                    ↘                                         ↗
                    rechazada / cancelada ←─────────────────
```

| Estado | Color | Descripción |
|--------|-------|-------------|
| `borrador` | Slate | Guardado sin enviar |
| `solicitada` | Blue | Enviada, pendiente de aprobación |
| `aprobada` | Indigo | Aprobada, pendiente de orden |
| `orden_emitida` | Amber | OC emitida al proveedor |
| `en_transito` | Cyan | Confirmado despacho, en camino |
| `recibida` | Emerald | Recepción registrada |
| `cerrada` | Green | Conformidad verificada y cerrada |
| `cancelada` | Rose | Cancelada en cualquier etapa |

---

## 5. Modelo de datos — Colección `compras`

### Documento principal

```typescript
interface Compra {
  id?: string;
  numero: number;                    // Secuencial por org
  tipo: CompraType;                  // repuesto | insumo | servicio_externo | ...
  estado: CompraEstado;              // borrador | solicitada | ...
  prioridad: CompraPrioridad;        // normal | urgente | critica

  // Solicitante
  solicitante_id: string;
  solicitante_nombre: string;
  area: string;                      // Taller | Administración | Comercial | ...
  motivo: string;                    // Título / razón de la compra
  justificacion?: string;            // Detalle ampliado

  // Fechas
  fecha_requerida?: Timestamp;       // Cuándo se necesita
  fecha_aprobacion?: Timestamp;
  fecha_orden?: Timestamp;
  fecha_recepcion?: Timestamp;
  fecha_cierre?: Timestamp;

  // Proveedor
  proveedor_id?: string;             // Ref a maestro de proveedores (futuro)
  proveedor_nombre?: string;
  proveedor_cuit?: string;
  proveedor_contacto?: string;

  // Ítems
  items: CompraItem[];

  // Montos
  monto_estimado?: number;
  monto_real?: number;
  moneda?: string;                   // 'ARS' | 'USD'

  // Vínculos opcionales
  orden_servicio_id?: string;
  oportunidad_crm_id?: string;
  hallazgo_id?: string;
  accion_id?: string;

  // ISO amendment 2024 — opcional
  impacto_ambiental?: boolean;
  criterio_ambiental?: string;

  // Recepción
  recepcion_tipo?: 'total' | 'parcial' | 'rechazada';
  recepcion_observaciones?: string;
  recepcion_by?: string;

  // Trazabilidad
  organization_id: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  historial?: HistorialEntry[];      // Log de cambios de estado
  notas?: string;
}
```

### Ítem de compra

```typescript
interface CompraItem {
  id: string;                        // uuid local
  descripcion: string;
  codigo_parte?: string;             // Part number CASE o genérico
  cantidad: number;
  cantidad_recibida?: number;        // Para recepción parcial
  unidad: string;                    // 'unidad' | 'kg' | 'litro' | 'metro'
  precio_unitario_estimado?: number;
  precio_unitario_real?: number;
  marca_referencia?: string;
  observaciones?: string;
  conforme?: boolean;                // Control de conformidad
}
```

---

## 6. Roles y permisos

| Acción | solicitante | comprador | jefe_area | gerente | deposito | calidad |
|--------|-------------|-----------|-----------|---------|----------|---------|
| Crear solicitud | ✓ | ✓ | ✓ | ✓ | — | — |
| Aprobar | — | — | ✓ | ✓ | — | — |
| Emitir OC | — | ✓ | ✓ | ✓ | — | — |
| Registrar recepción | — | — | — | — | ✓ | — |
| Registrar incidencia | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cerrar | — | ✓ | ✓ | ✓ | — | — |
| Cancelar | — | — | ✓ | ✓ | — | — |
| Ver todo | — | ✓ | ✓ | ✓ | — | ✓ |
| Ver propias | ✓ | — | — | — | ✓ | — |

*En MVP inicial todos los roles `admin` / `gerente` / `jefe` ven todo. Se refinan en Fase 2.*

---

## 7. Pantallas del módulo (MVP)

### 7.1 Kanban Principal — `/compras`
- Header: título + botón "Nueva Compra" + filtros (tipo, prioridad, área)
- Columnas: borrador / solicitada / aprobada / orden_emitida / recibida / cerrada / cancelada
- Tarjeta: número, tipo badge, motivo (truncado), proveedor, monto estimado, prioridad badge, fecha requerida
- Panel derecho (320px sticky): detalle de la compra seleccionada con selector de estado, ítems, notas

### 7.2 Modal / Drawer "Nueva Compra"
- Tipo de compra
- Motivo + justificación
- Prioridad
- Área solicitante
- Fecha requerida
- Proveedor (texto libre, MVP)
- Ítems (agregar/quitar dinámicamente): descripción, código, cantidad, precio estimado
- Vínculos opcionales (orden de servicio, hallazgo)

### 7.3 Vista de detalle (panel derecho en Kanban)
- Estado actual + selector de transición
- Datos del solicitante
- Ítems con cantidades y precios
- Proveedor
- Historial de cambios de estado
- Campo de notas internas

---

## 8. API Routes planeadas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/compras` | Listar por org, con filtros |
| POST | `/api/compras` | Crear nueva solicitud |
| GET | `/api/compras/[id]` | Detalle de una compra |
| PATCH | `/api/compras/[id]` | Actualizar estado, campos, notas |
| DELETE | `/api/compras/[id]` | Eliminar borrador |
| GET | `/api/compras/stats` | Métricas para Mapa de Procesos |

---

## 9. Métricas e indicadores

Disponibles en `/api/compras/stats` para el Mapa de Procesos:

- Total de compras por estado
- Compras urgentes/críticas pendientes → `pending` en ProcessMetric
- Tiempo promedio solicitud → aprobación
- Tiempo promedio solicitud → recepción
- % entregas conformes
- Compras por tipo (repuesto vs servicio vs insumo)
- Compras por área

---

## 10. Integración con Mapa de Procesos

El `processKey` del Mapa de Procesos para este módulo es **`compras`**.

La API `/api/mapa-procesos/metrics` deberá agregar:
```typescript
// En /api/mapa-procesos/metrics/route.ts — agregar:
const comprasRes = await adminDb.collection('compras')
  .where('organization_id', '==', orgId)
  .where('estado', 'in', ['solicitada', 'aprobada', 'orden_emitida'])
  .count().get();

metrics.compras = {
  pending: comprasRes.data().count,
  status: comprasRes.data().count > 5 ? 'warning' : 'ok'
};
```

---

## 11. Registro de Capability

```typescript
{
  id: 'dealer_compras',
  name: 'Compras Dealer',
  description: 'Gestión del proceso de compras de repuestos, insumos y servicios para concesionarios de maquinaria agrícola.',
  tier: 'opcional',
  icon: 'ShoppingCart',
  color: 'amber',
  tags: ['dealer', 'compras', 'repuestos', 'proveedores'],
  dependencies: ['dealer_solicitudes'],    // Se activa junto a dealer
  navigation: [
    { name: 'Compras', href: '/compras', icon: 'ShoppingCart', feature: 'dealer_compras' }
  ],
  datasets: ['compras']
}
```

---

## 12. Backlog por etapas

### MVP (implementar ahora)
- [x] Modelo de datos `compras.ts`
- [x] API CRUD `/api/compras`
- [x] Página Kanban `/compras` con panel de detalle
- [x] Cambio de estado desde el panel
- [x] Formulario de nueva compra con ítems
- [x] Nav entry bajo Procesos Operativos
- [x] Capability `dealer_compras` registrada

### Fase 2 (próxima iteración)
- [ ] Maestro de proveedores `/compras/proveedores`
- [ ] Generación de PDF de Orden de Compra
- [ ] Recepción con foto adjunta (Firebase Storage)
- [ ] Registro de incidencias con derivación a Hallazgos
- [ ] Historial de cambios de estado visible en UI
- [ ] Filtros avanzados (área, rango de fechas, monto)

### Fase 3 (escalado)
- [ ] Circuito de aprobación multinivel configurable por tenant
- [ ] Integración con stock/inventario
- [ ] Evaluación de proveedor post-cierre
- [ ] Notificaciones WhatsApp/email al proveedor
- [ ] Dashboard ejecutivo de compras
- [ ] Integración contable (cuentas a pagar)

---

## 13. Alineación ISO 9001:2015

| Cláusula | Aplicación en este módulo |
|----------|--------------------------|
| **8.4.1** Control general | Estado `aprobada` como control de proveedor externo |
| **8.4.2** Tipo y alcance del control | `recepcion_tipo` + control de conformidad por ítem |
| **8.4.3** Información a proveedores | OC con ítems, cantidades, specs y condiciones |
| **7.1.6** Conocimiento organizacional | Historial de compras = base de datos de proveedores |
| **10.2** No conformidades | Incidencias derivan a colección `findings` |
| **Enmienda 2024** | Campo `impacto_ambiental` opcional en cada compra |

---

*Documento generado: 2026-03-10 | Responsable técnico: Don Cándido IA / Claude Sonnet*
