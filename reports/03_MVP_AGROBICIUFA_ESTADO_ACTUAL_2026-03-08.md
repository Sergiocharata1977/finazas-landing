# 03 — MVP Agro Biciufa — Estado actual y arquitectura

**Fecha:** 2026-03-08
**Proyectos involucrados:** `9001app-firebase` + `Landing-Agrobiciufa`

---

## 1. Contexto del cliente

**Agro Biciufa SRL** es un concesionario CASE IH (maquinaria agrícola) en Argentina. Antes del MVP: los clientes consultaban por repuestos, servicios y maquinaria por teléfono o WhatsApp directo al operario. Sin trazabilidad, sin historial, sin reportes.

**El MVP resuelve:** capturar todas las consultas desde la web, notificar al operario automáticamente por WhatsApp, gestionar el estado desde un panel interno y mantener historial completo en Firestore.

---

## 2. Flujo completo implementado

```
Cliente en landing-agrobiciufa.vercel.app
  └─ Elige tipo de consulta:
       ├─ REPUESTO: máquina + modelo + N°serie + descripción del repuesto
       ├─ SERVICIO TÉCNICO: máquina + localidad + descripción del problema
       └─ COMERCIAL: elige producto del catálogo real + requiere financiación

  └─ Envía formulario → POST https://doncandidoia.com/api/public/solicitudes
        ├─ Valida datos (Zod)
        ├─ Genera número SOL-XXXXXXXXXX
        ├─ Guarda en Firestore: organizations/org_agrobiciufa/solicitudes/{id}
        ├─ WhatsApp al operario: "Nueva solicitud dealer — [datos del cliente]"
        ├─ WhatsApp al cliente: "Recibimos tu solicitud SOL-XXXX"
        └─ Si tipo=comercial → crea oportunidad en CRM (organizations/org_agrobiciufa/oportunidades)

Operario en doncandidoia.com/solicitudes
  └─ Ve todas las solicitudes con filtros (tipo/estado)
  └─ Click en solicitud → panel de detalle lateral
  └─ Cambia estado: recibida → en_revision → gestionando → cerrada
  └─ Cada cambio de estado → WhatsApp automático al cliente
  └─ Estado "cerrada" → mensaje al cliente pidiendo confirmación "OK"
  └─ Puede asignar la solicitud a un operario específico

Admin en doncandidoia.com/dealer/catalogo
  └─ CRUD de productos: nombre, categoría, marca, modelo, precio contado, precio lista
  └─ Toggle activo/inactivo — solo activos aparecen en la landing
  └─ Catálogo expuesto en GET /api/public/productos (cache 5 min, rate limit 50 req/h)
```

---

## 3. APIs implementadas

### APIs públicas (sin auth de usuario, solo org por env var)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/productos` | Catálogo activo. Params: `categoria`, `destacados`, `limit` |
| POST | `/api/public/solicitudes` | Crear solicitud. Genera SOL-XXXX, dispara WhatsApp |
| GET | `/api/public/solicitudes/mias` | Portal cliente: sus solicitudes por email (requiere Firebase ID token) |

### APIs privadas dealer (requieren auth Bearer + rol admin/gerente)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/dealer/productos` | Lista con stock y todos los campos |
| POST | `/api/dealer/productos` | Crear producto |
| GET | `/api/dealer/productos/[id]` | Detalle de producto |
| PATCH | `/api/dealer/productos/[id]` | Actualizar producto |
| DELETE | `/api/dealer/productos/[id]` | Soft delete (activo: false) |
| GET | `/api/solicitudes` | Lista de solicitudes con filtros |
| PATCH | `/api/solicitudes/[id]` | Actualizar estado + dispara WhatsApp |

---

## 4. Modelo de datos — Solicitud

```typescript
// organizations/{orgId}/solicitudes/{id}
{
  id: string,
  numero: string,           // "SOL-1741234567890"
  organization_id: string,
  tipo: 'repuesto' | 'servicio' | 'comercial',
  estado: 'recibida' | 'en_revision' | 'gestionando' | 'cerrada' | 'cancelada',
  prioridad: 'baja' | 'media' | 'alta' | 'critica' | null,
  nombre: string,           // nombre del cliente
  telefono: string | null,
  email: string | null,
  cuit: string | null,
  mensaje: string | null,
  payload: {
    // repuesto:
    maquina_tipo?, modelo?, numero_serie?, descripcion_repuesto?
    // servicio:
    maquina_tipo?, modelo?, numero_serie?, localidad?, provincia?, descripcion_problema?
    // comercial:
    producto_id?, producto_nombre?, precio_referencia?, requiere_financiacion?, comentarios?
  },
  origen: string,           // "landing_agrobiciufa"
  assigned_to: string | null,
  crm_oportunidad_id: string | null,
  crm_sync_status: 'not_applicable' | 'pending' | 'synced' | 'error' | null,
  created_at: Timestamp,
  updated_at: Timestamp,
}
```

---

## 5. Modelo de datos — Producto del catálogo

```typescript
// organizations/{orgId}/productos/{id}
{
  id: string,
  organization_id: string,
  nombre: string,
  descripcion: string | null,
  categoria: 'maquinaria' | 'implemento' | 'repuesto' | 'servicio' | 'otro',
  marca: string | null,      // "CASE IH"
  modelo: string | null,     // "Puma 185"
  precio_contado: number | null,
  precio_lista: number | null,
  stock: number | null,
  imagenes: string[],        // URLs de Firebase Storage
  activo: boolean,
  destacado: boolean,
  created_at: Timestamp,
  updated_at: Timestamp,
}
```

---

## 6. Configuración en Firestore necesaria para activar el MVP

### Paso 1 — Crear la organización

```
Colección: organizations
Documento ID: org_agrobiciufa

Campos:
  nombre: "Agro Biciufa SRL"
  slug: "agrobiciufa"
  activo: true
  whatsapp_notificaciones_dealer: "+549XXXXXXXXXX"   ← número del operario
```

### Paso 2 — Activar capability dealer

```
Colección: organizations/org_agrobiciufa/capabilities
Documento ID: dealer_solicitudes

Campos:
  activo: true
  installedAt: [timestamp actual]
```

### Paso 3 — Variables de entorno en Vercel

**9001app-firebase project:**
```
DEALER_PUBLIC_ORGANIZATION_ID = org_agrobiciufa
TWILIO_WHATSAPP_NUMBER = whatsapp:+1415XXXXXXX
```

**Landing-Agrobiciufa project:**
```
NEXT_PUBLIC_9001APP_URL = https://doncandidoia.com
```

---

## 7. Qué falta para la siguiente etapa (post-MVP)

| Feature | Prioridad | Esfuerzo |
|---------|-----------|---------|
| Portal cliente: `/mi-cuenta` con listado de sus solicitudes | Alta | Medio — el endpoint `GET /api/public/solicitudes/mias` ya existe, falta la UI en la landing |
| Vincular solicitud con usuario autenticado de la landing | Alta | Medio — requiere Firebase Auth en landing + ID token en POST solicitudes |
| Vista Kanban en panel de solicitudes `/solicitudes` | Alta | Bajo — el componente existe, solo falta integrar |
| Carga de imágenes reales del catálogo | Media | Bajo |
| Badge de solicitudes nuevas en el menú | Media | Bajo |
| Estados del Kanban configurables por org en Firestore | Media | Medio |
| Integración Don Cándido Finanzas (créditos) | Baja | Alto — Fase 4 |

---

## 8. Decisión estratégica confirmada por este caso

El caso Agro Biciufa valida la arquitectura de expansión del sistema:

- **9001app-firebase es el hub operativo.** No se crea un sistema separado por cliente.
- **La landing es solo la capa de UX pública.** No tiene base de datos propia. Todo dato vive en 9001app.
- **Las capabilities permiten escalar a otros dealers.** Si mañana se suma otro concesionario, se crea una nueva organización en Firestore, se activa `dealer_solicitudes`, y comparte exactamente el mismo código.
- **Don Cándido Finanzas** es para la capa de crédito/cuenta corriente. No es necesaria en el MVP.
