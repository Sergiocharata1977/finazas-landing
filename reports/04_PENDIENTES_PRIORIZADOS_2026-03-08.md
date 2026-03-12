# 04 — Pendientes priorizados

**Fecha:** 2026-03-08

---

## Criterio de esta lista

Solo pendientes concretos con impacto real. No es un plan de trabajo, no tiene fechas. Cada ítem indica el archivo o ruta donde empieza el trabajo.

---

## Prioridad ALTA — Afectan la operación o la demo del MVP

### 1. Configurar Firestore para activar MVP Agro Biciufa

**Qué falta:** crear el documento `organizations/org_agrobiciufa` con el campo `whatsapp_notificaciones_dealer` y la capability `dealer_solicitudes` activa.

**Dónde:** Firebase Console → Firestore → colección `organizations`

Ver instrucciones completas en reporte `03_MVP_AGROBICIUFA_ESTADO_ACTUAL_2026-03-08.md` sección 6.

---

### 2. Variables de entorno en Vercel

**Qué falta:**
- `DEALER_PUBLIC_ORGANIZATION_ID=org_agrobiciufa` en proyecto 9001app-firebase
- `TWILIO_WHATSAPP_NUMBER=whatsapp:+1415XXXXXXX` en proyecto 9001app-firebase
- `NEXT_PUBLIC_9001APP_URL=https://doncandidoia.com` en proyecto Landing-Agrobiciufa

**Dónde:** Vercel Dashboard → Settings → Environment Variables

---

### 3. Vista Kanban para el panel de Solicitudes

**Qué falta:** la página `/solicitudes` tiene lista + detalle pero no tiene Kanban visual por estados.

**Dónde empezar:** `src/app/(dashboard)/solicitudes/page.tsx`

**Referencia para implementar:** `src/components/findings/FindingKanban.tsx` (mismo patrón de columnas CSS flex + `flex-shrink-0 w-80`).

**Columnas del Kanban:**
- Recibida (gris/slate)
- En Revisión (azul)
- Gestionando (amarillo/amber)
- Cerrada (verde)
- Cancelada (rojo, opcional/colapsada)

**Toggle lista/Kanban:** botones `LayoutList` / `LayoutGrid` (Lucide) en el header de la página.

---

### 4. Verificación end-to-end del flujo Agro Biciufa

**Qué falta:** una vez configurado Firestore y las env vars, verificar:

1. `GET /api/public/productos` devuelve catálogo
2. Formulario de la landing carga el catálogo
3. Enviar formulario → aparece en `/solicitudes`
4. WhatsApp llega al operario
5. WhatsApp llega al cliente (acuse)
6. Cambiar estado → WhatsApp llega al cliente

**Checklist completo en:** `reports/44_CIERRE_MVP_AGROBICIUFA_2026-03-08.md`

---

### 5. Integrar ContextHelpButton en pantallas clave

**Qué falta:** el botón de ayuda contextual existe (`src/components/docs/ContextHelpButton.tsx`) pero no está integrado en las páginas principales.

**Páginas prioritarias:**
- `src/app/(dashboard)/procesos/page.tsx`
- `src/app/(dashboard)/auditorias/page.tsx`
- `src/app/(dashboard)/crm/page.tsx`
- `src/app/(dashboard)/mi-panel/page.tsx`
- `src/app/(onboarding)/` páginas de onboarding

**Uso:**
```tsx
<ContextHelpButton module="procesos" />
```

---

## Prioridad MEDIA — Mejoran el producto pero no bloquean operación

### 6. Kanban de solicitudes con estados configurables por organización

**Idea:** los labels y colores de los estados del Kanban de solicitudes deberían poder configurarse por org en Firestore, sin necesidad de deploy.

**Modelo propuesto:**
```
organizations/{orgId}/kanban_config/solicitudes
  columnas: [
    { id: "recibida", label: "Recibida", color: "#94a3b8", orden: 0 },
    { id: "en_revision", label: "En Revisión", color: "#3b82f6", orden: 1 },
    ...
  ]
```

Los estados del enum `SolicitudEstado` son fijos (backend no cambia), pero los labels y colores son editables desde el panel super-admin.

---

### 7. Documentar proceso CRM y scoring en el Manual de sistema

**Qué falta:** no hay docs en `content/docs/crm/` que expliquen el proceso ejecutivo de scoring y líneas de crédito.

**Dónde crear:**
- `content/docs/crm/proceso-de-scoring.md`
- `content/docs/crm/lineas-de-credito.md`

---

### 8. Mejorar dashboards de auditorías y documentos

**Qué falta:** las páginas tienen listas pero no tienen indicadores de tendencia (auditorías abiertas vs cerradas por mes, documentos vencidos, etc.).

**Archivos:**
- `src/app/(dashboard)/auditorias/page.tsx`
- `src/app/(dashboard)/documentos/page.tsx`

---

### 9. Sandbox Nosis para desarrollo local

**Qué falta:** la integración con Nosis requiere credenciales reales. No hay mock para desarrollo.

**Dónde:** `src/services/nosis/` — agregar un cliente mock activable por env var.

---

## Prioridad ESTRATÉGICA — Decisiones de producto, no de código

### 10. Portal de clientes dealer

El endpoint `GET /api/public/solicitudes/mias` ya existe. Para activar el portal:

1. Agregar Firebase Auth a la landing (mismo proyecto Firebase de 9001app)
2. Registrar/login con email en la landing
3. La landing pide el ID token y lo manda en `Authorization: Bearer`
4. El endpoint filtra solicitudes por email del token

**Decisión pendiente:** ¿usar Firebase Auth de 9001app o crear un proyecto Firebase separado para la landing?

**Recomendación:** usar el mismo proyecto Firebase de 9001app — evita duplicar usuarios y permite vincular solicitudes con usuarios internos si algún día el cliente es también un usuario del backoffice.

---

### 11. Política de tenants nuevos

Cada nuevo cliente (dealer u organización ISO) requiere:
1. Documento en `organizations/{orgId}` en Firestore
2. Capabilities activadas según el plan contratado
3. Variables de entorno si usa APIs públicas (`DEALER_PUBLIC_ORGANIZATION_ID` si es el único tenant público — evaluar si escala a multi-tenant público)

**Pendiente:** si hay más de un dealer activo, `DEALER_PUBLIC_ORGANIZATION_ID` no escala. La API pública debería resolver la org por subdominio o por `x-tenant-slug` en el header.

---

### 12. Integración Don Cándido Finanzas (Fase 4)

Reservado para cuando Agro Biciufa necesite gestionar créditos y cuenta corriente con sus clientes. No tiene fecha. El diseño del modelo de datos (`equipos_crm`, número de serie VIN) ya prevé esta integración.
