# Análisis de Kanbans — Design System 9001app-firebase
**Reporte 19 | Fecha: 2026-03-10 | Estado: ANÁLISIS / DECISIÓN**

---

## 1. Inventario completo de Kanbans

| # | Módulo | Ruta | Columnas actuales | ¿Editable? | Drag & Drop | Fuente de datos |
|---|--------|------|-------------------|------------|-------------|-----------------|
| 1 | CRM Oportunidades | `/crm` | Dinámicas desde Firestore | ✅ **SÍ** | ✅ Sí (Atlaskit) | `estados_kanban` |
| 2 | CRM Credit Workflow | `/crm` (sub) | pendiente / en_análisis / documentación / comité / aprobado / rechazado | ❌ Hardcoded | ❌ No | `credit_workflows` |
| 3 | RRHH Tareas | `/rrhh/kanban` | todo / in-progress / review / done | ❌ Hardcoded | ✅ Sí | in-memory |
| 4 | Acciones Correctivas | `/mejoras/acciones` | planificada / ejecutada / en_control / completada | ❌ Hardcoded | ❌ No | `actions` |
| 5 | Auditorías | `/mejoras/auditorias` | planned / in_progress / completed | ❌ Hardcoded | ❌ No | `audits` |
| 6 | Hallazgos | `/mejoras/hallazgos` | registrado / en_tratamiento / cerrado | ❌ Hardcoded | ❌ No | `findings` |
| 7 | Procesos Registros | `/procesos/[id]` | pendiente / en-progreso / completado | ❌ Hardcoded | ✅ Sí | `process_records` |
| 8 | CRM Acciones | `/crm/oportunidades` | programada / completada / vencida | ❌ Hardcoded | ❌ No | `crm_acciones` |
| 9 | Solicitudes Dealer | `/solicitudes` | recibida / en_revision / gestionando / cerrada / cancelada | ❌ Hardcoded | ❌ No | `solicitudes` |
| 10 | Calendario | `/calendario` | scheduled / in_progress / completed / cancelled / overdue | ❌ Hardcoded | ❌ No | `events` |
| 11 | Tareas Privadas | `/private-sections` | pending / in_progress / review / completed | ❌ Hardcoded | ✅ Sí (HTML5) | `user_private_tasks` |

**Resultado: 10 de 11 Kanbans tienen columnas hardcodeadas.**
**Solo CRM Oportunidades permite que el tenant defina sus propias etapas.**

---

## 2. Componentes Kanban existentes

### `UnifiedKanban` — componente reutilizable
- **Ubicación:** `src/components/ui/unified-kanban.tsx`
  También en: `src/components/design-system/patterns/kanban/UnifiedKanban.tsx` (referencia con Atlaskit)
- **Capacidades:** columnas configurables, drag-and-drop, tarjetas personalizables
- **Usado en:** CRM Oportunidades, RRHH Tareas

### Kanbans custom (no reutilizables)
Cada módulo ISO tiene su propia implementación inline:
- `ActionKanban.tsx` — solo filtra por columna, sin DnD
- `FindingKanban.tsx` — igual
- `AuditKanban.tsx` — igual
- `CreditWorkflowKanban.tsx` — inline en el CRM, sin DnD

---

## 3. El único modelo configurable: CRM Oportunidades

### Cómo funciona
- Las columnas se almacenan en Firestore: `organizations/{orgId}/estados_kanban`
- El servicio `KanbanServiceAdmin` gestiona CRUD de estados por tenant
- Cada estado tiene: `id`, `nombre`, `color`, `orden`, `tipo` (activo/ganado/perdido)
- La API `/api/crm/kanban/estados` sirve la lista al cliente
- El `UnifiedKanban` recibe las columnas como prop y renderiza dinámicamente

### Limitación actual
El modelo de estados configurables solo está conectado a CRM. Los demás módulos no tienen este mecanismo aunque el componente `UnifiedKanban` técnicamente lo soportaría.

---

## 4. Clasificación propuesta para el Design System

### Categoría A — FROZEN (estados normativos, no editables)
Los estados forman parte de la lógica ISO o son inmutables por diseño.
Cambiarlos rompería trazabilidad o compliance.

| Módulo | Justificación |
|--------|---------------|
| Hallazgos | ISO 9001 define el ciclo: registro → tratamiento → cierre |
| Auditorías | Planned → In Progress → Completed es el ciclo de la norma |
| Acciones Correctivas | Planificada → Ejecutada → En Control → Completada = ciclo PDCA |
| Credit Workflow | Lógica bancaria/financiera con pasos regulados |

### Categoría B — CONFIGURABLE (estados definidos por tenant)
El flujo es operativo y varía según cómo trabaja cada empresa.
El tenant debe poder definir sus etapas, nombres y colores.

| Módulo | Justificación |
|--------|---------------|
| CRM Oportunidades | ✅ Ya implementado — el pipeline de ventas varía por empresa |
| **Compras** | ⬜ **A implementar** — el proceso de compras varía mucho (con/sin cotizaciones, multinivel, etc.) |
| **Solicitudes Dealer** | ⬜ Candidato — hoy hardcoded, debería ser configurable |
| Procesos Registros | ⬜ Candidato — depende del proceso específico |

### Categoría C — PERSONAL (estados por usuario, no por org)
El tablero es del usuario, no de la organización.

| Módulo | Justificación |
|--------|---------------|
| RRHH Tareas | Tablero personal de trabajo diario |
| Tareas Privadas | Igual |

---

## 5. Decisión de arquitectura — Kanbans Configurables

**El tenant define sus propias etapas.**
Este es el modelo correcto para módulos operativos donde cada empresa tiene su proceso.

### Patrón de implementación (basado en CRM)

```
Firestore:
  organizations/{orgId}/kanban_configs/{modulo}
    estados: [
      { id, nombre, color, orden, tipo, descripcion }
    ]
    modulo: 'compras' | 'solicitudes' | 'procesos'
    updated_at: Timestamp
    updated_by: string
```

### Estados por defecto (fallback en código)
Cada módulo define sus estados default en código.
Si el tenant no configuró nada, se usa el default.
Si configuró, se usan los de Firestore.

### Editor de estados
- Página en `/configuracion/kanban/{modulo}`
- Agregar / renombrar / reordenar / colorear columnas
- No se pueden eliminar columnas que tienen ítems activos
- Columnas obligatorias marcadas como no-eliminables (ej: `cerrada`, `cancelada`)

---

## 6. Deuda técnica identificada

| Item | Módulo afectado | Prioridad |
|------|-----------------|-----------|
| Solicitudes Dealer tiene estados hardcoded | `/solicitudes` | Media |
| RRHH Kanban usa datos in-memory (no persiste) | `/rrhh/kanban` | Alta |
| No existe editor de estados para ningún módulo salvo CRM | Todos | Media |
| `ActionKanban`, `FindingKanban`, `AuditKanban` son implementaciones paralelas no reutilizadas | Mejoras | Baja |
| No hay DnD en la mayoría de los Kanbans | 8 de 11 | Media |

---

## 7. Hoja de ruta para unificar el Design System Kanban

### Paso 1 — Definir el patrón universal (ahora)
- Documentar el contrato de `UnifiedKanban` (props, columnas, tarjetas)
- Definir la colección `kanban_configs` en Firestore como estándar
- Crear el componente `KanbanEstadoEditor` reutilizable

### Paso 2 — Aplicar a módulos nuevos (Compras)
- Compras nace con estados configurables desde el día 1
- Usa `kanban_configs/compras` con fallback a estados default

### Paso 3 — Migrar módulos existentes (iterativo)
- Solicitudes Dealer → migrar a configurable
- Procesos Registros → evaluar si aplica
- Mantener Hallazgos / Auditorías / Acciones como Frozen

---

## 8. Especificación del editor de Kanban (para Compras y futuros)

### Colección
```
organizations/{orgId}/kanban_configs/compras
  estados: EstadoKanban[]
  created_at: Timestamp
  updated_at: Timestamp
```

### Tipo `EstadoKanban`
```typescript
interface EstadoKanban {
  id: string;           // slug único (ej: 'solicitada', 'en_cotizacion')
  nombre: string;       // Label visible
  color: string;        // Tailwind color name: 'blue' | 'amber' | 'emerald' | ...
  orden: number;        // Para ordenar columnas
  tipo: 'activo' | 'cerrado' | 'cancelado';  // Semántica del estado
  es_default: boolean;  // Si es el estado inicial para nuevos registros
  bloqueado: boolean;   // Si el tenant no puede eliminarlo (estados clave del proceso)
  descripcion?: string;
}
```

### Estados default de Compras
```typescript
const DEFAULT_ESTADOS_COMPRAS: EstadoKanban[] = [
  { id: 'borrador',      nombre: 'Borrador',       color: 'slate',   orden: 1, tipo: 'activo',    es_default: true,  bloqueado: false },
  { id: 'solicitada',    nombre: 'Solicitada',      color: 'blue',    orden: 2, tipo: 'activo',    es_default: false, bloqueado: false },
  { id: 'aprobada',      nombre: 'Aprobada',        color: 'indigo',  orden: 3, tipo: 'activo',    es_default: false, bloqueado: false },
  { id: 'orden_emitida', nombre: 'Orden Emitida',   color: 'amber',   orden: 4, tipo: 'activo',    es_default: false, bloqueado: false },
  { id: 'recibida',      nombre: 'Recibida',        color: 'emerald', orden: 5, tipo: 'activo',    es_default: false, bloqueado: false },
  { id: 'cerrada',       nombre: 'Cerrada',         color: 'green',   orden: 6, tipo: 'cerrado',   es_default: false, bloqueado: true  },
  { id: 'cancelada',     nombre: 'Cancelada',       color: 'rose',    orden: 7, tipo: 'cancelado', es_default: false, bloqueado: true  },
];
```

### Reglas de negocio del editor
- No se puede eliminar una columna que tiene ítems activos
- Las columnas `bloqueado: true` no se pueden eliminar (solo renombrar)
- El orden se edita con drag-and-drop en el editor
- El color se elige de una paleta fija (para garantizar legibilidad)
- Solo 1 estado puede ser `es_default: true`

---

## 9. Impacto en módulo Compras

El módulo `dealer_compras` (Reporte 18) nace con este modelo:

1. Al activar el plugin, se inicializa `kanban_configs/compras` con los estados default
2. El tenant puede ir a `/configuracion/kanban/compras` y personalizar
3. La página `/compras` lee los estados desde Firestore (con fallback a default)
4. Las métricas del Mapa de Procesos cuentan ítems en estados `tipo: 'activo'`

---

*Documento generado: 2026-03-10 | Don Cándido IA / Claude Sonnet*
