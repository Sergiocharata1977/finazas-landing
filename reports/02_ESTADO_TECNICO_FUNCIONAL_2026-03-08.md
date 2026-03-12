# 02 — Estado técnico y funcional del sistema

**Fecha:** 2026-03-08
**Proyecto:** `9001app-firebase`

---

## 1. Resumen ejecutivo

El sistema está en estado funcional alto y es una base de código real, no un prototipo. La auditoría técnica de marzo 2026 identificó brechas de seguridad y deuda técnica. Ese bloque fue resuelto. La plataforma hoy soporta clientes reales, capabilities premium y flujos externos como Agro Biciufa.

**Lo que no falta:** arquitectura, seguridad base, módulos ISO, CRM, IA unificada, onboarding, CI/CD.
**Lo que todavía se está consolidando:** UX de ciertos flujos, dashboards avanzados, analytics de negocio, portal de clientes externos.

---

## 2. Mapa de archivos clave del sistema

### APIs y middleware
```
src/middleware.ts                          gate global de auth (Bearer/cookie)
src/lib/api/withAuth.ts                    wrapper de autenticación para API routes
src/middleware/verifyOrganization.ts       resolveAuthorizedOrganizationId
src/lib/api/errors.ts                      toOrganizationApiError y helpers
```

### Firebase
```
src/lib/firebase/admin.ts                  getAdminFirestore(), getAdminAuth(), getAdminStorage()
src/lib/firebase/client.ts                 Firebase client SDK
firestore.rules                            reglas multi-tenant (isAdmin, isManager, belongsToOrganization)
storage.rules                              reglas de storage (brecha cross-org cerrada en L29)
```

### IA y asistente
```
src/services/ai-core/UnifiedConverseService.ts   cerebro único de IA, todos los canales pasan por aquí
src/services/ai-core/conversationStore.ts        historial de conversaciones en Firestore
src/services/ai-core/adapters/                   chat, voz, WhatsApp
src/ai/services/LLMRouter.ts                     routing multi-provider (Claude → Groq fallback)
src/ai/prompts/                                  prompts versionados
src/ai/schemas/                                  schemas Zod para respuestas IA
src/app/api/ai/converse/route.ts                 endpoint central de conversación
```

### Módulo Dealer (nuevo, MVP Agro Biciufa)
```
src/types/dealer-catalogo.ts                     tipos ProductoDealer, CreateProductoDealerInput
src/services/dealer/ProductoDealerService.ts     CRUD de productos en Firestore
src/app/api/dealer/productos/route.ts            GET lista + POST crear (auth admin/gerente)
src/app/api/dealer/productos/[id]/route.ts       GET + PATCH + DELETE soft
src/app/api/public/productos/route.ts            catálogo público (rate limit + cache 5min)
src/app/api/public/solicitudes/route.ts          crear solicitud pública + WhatsApp
src/app/api/public/solicitudes/mias/route.ts     portal cliente: sus solicitudes por email
src/app/api/solicitudes/[id]/route.ts            actualizar estado + WhatsApp al cambiar estado
src/app/(dashboard)/dealer/catalogo/page.tsx     panel CRUD de catálogo
src/app/(dashboard)/solicitudes/page.tsx         panel maestro de solicitudes (lista + detalle)
```

### Documentación in-app
```
content/docs/                              37 archivos MD organizados por módulo
src/lib/docs/loader.ts                     lee filesystem, no BD, no filtra por org
src/lib/docs/parser.ts                     parsea frontmatter YAML + contenido MD
src/components/docs/DocumentationLayout.tsx  UI del Manual de sistema
src/components/docs/DocBadge.tsx           badge de módulo (debe tener entrada por cada DocModule)
src/types/docs.ts                          DocModule, DocCategory, DocMeta, Doc
next.config.js                             outputFileTracingIncludes para que Vercel bundlee los MD
```

### CRM
```
src/app/(crm)/                             layout y páginas del módulo CRM
src/services/crm/                          servicios de clientes, oportunidades, scoring
src/app/api/crm/                           APIs del módulo CRM
src/types/crm.ts                           tipos del CRM
```

### Capabilities
```
src/lib/plugins/runtimeFlags.ts            isDynamicNavEnabled()
src/config/navigation.ts                   nav con feature gates por capability
src/app/api/capabilities/                  CRUD de capabilities por organización
```

### Analytics y observabilidad
```
src/lib/analytics/events.ts               constantes de eventos PostHog
src/lib/analytics/server.ts               analytics server-side
sentry.*.config.ts                        3 configs Sentry (server, client, edge)
```

---

## 3. Estado por módulo

### ALTO (producción, sin deuda crítica)
| Módulo | Rutas | API Routes | Estado |
|--------|-------|-----------|--------|
| Core auth/tenant | - | src/middleware.ts | Completo |
| Mi SGC | /mi-sgc | /api/sgc/ | Completo |
| Procesos | /procesos | /api/procesos/ | Completo |
| Auditorías | /mejoras/auditorias | /api/audits/ | Completo |
| Hallazgos | /mejoras/hallazgos | /api/findings/ | Completo |
| Acciones | /mejoras/acciones | /api/actions/ | Completo |
| Documentos | /documentos | /api/documentos/ | Completo |
| RRHH | /rrhh | /api/rrhh/ | Completo |
| Mi Panel | /mi-panel | /api/mi-panel/ | Completo |
| Docs interna | /documentacion | filesystem | Completo (37 docs) |

### MEDIO-ALTO (funcional, con deuda menor)
| Módulo | Área de mejora |
|--------|---------------|
| CRM | Dashboard de métricas, documentación ejecutiva del proceso |
| Onboarding federado | UX del flujo estratégico, salidas y continuidad entre fases |
| Módulo Dealer | Kanban de solicitudes por estado, portal cliente (post-MVP) |
| Capabilities runtime | Depende de env vars configuradas en Vercel |

### MEDIO (funcional, en maduración)
| Módulo | Área de mejora |
|--------|---------------|
| IA omnicanal | LLMRouter funcionando, maduración de prompts en producción |
| Analytics negocio | PostHog instalado, eventos básicos, falta dashboard ejecutivo |
| ISO Design (8.3) | Implementado como capability premium, UX en refinamiento |
| ISO Infra (7.1.3) | Implementado como capability premium, UX en refinamiento |

---

## 4. Brechas de seguridad — estado actual

| Brecha | Estado |
|--------|--------|
| storage.rules lectura cross-org | **CERRADA** — L29 verifica organization_id |
| personnel/trainings sin role guard | **CERRADA** — isManager() en create |
| service-account.json expuesto | **SEGURO** — nunca fue commiteado |
| WhatsApp webhook sin HMAC | **CERRADA** — timingSafeEqual implementado |
| Onboarding sin guards de fase | **CERRADO** — validatePhase() en src/lib/onboarding/ |

**No hay brechas de seguridad críticas abiertas.**

---

## 5. Integración WhatsApp (Twilio)

**Patrón fire-and-forget** — nunca bloquea la respuesta HTTP:

```typescript
// Ejemplo en src/app/api/public/solicitudes/route.ts
try {
  await WhatsAppService.sendMessage(operatorNumber, buildOperatorMessage(solicitud));
  await WhatsAppService.sendMessage(clientNumber, buildClientMessage(solicitud));
} catch (err) {
  console.error('[WhatsApp]', err); // Log pero no falla el endpoint
}
```

**Variables de entorno necesarias:**
- `TWILIO_ACCOUNT_SID` — SID de la cuenta Twilio
- `TWILIO_AUTH_TOKEN` — token de autenticación Twilio
- `TWILIO_WHATSAPP_NUMBER` — número WhatsApp (`whatsapp:+1415XXXXXXX`)

**Número del operario** — se lee desde Firestore: `organizations/{orgId}.whatsapp_notificaciones_dealer`

---

## 6. Configuración de Vercel crítica

### Variables de entorno mínimas para el módulo Dealer
```
DEALER_PUBLIC_ORGANIZATION_ID=org_agrobiciufa
```

### Para Landing-Agrobiciufa
```
NEXT_PUBLIC_9001APP_URL=https://doncandidoia.com
```

### outputFileTracingIncludes (next.config.js)
```javascript
experimental: {
  outputFileTracingIncludes: {
    '/**': ['./content/docs/**/*'],  // ← '/**' no '/*' (error frecuente)
  },
},
```

**Esto es crítico:** si se usa `'/*'` en lugar de `'/**'`, los docs MD no se incluyen en el bundle serverless de Vercel y el Manual de sistema muestra 0 documentos.

---

## 7. Deuda técnica pendiente (no bloquea producción)

### Deuda alta (afecta UX operativa)
- `ContextHelpButton` no está integrado en todas las pantallas clave (onboarding, procesos, auditorías, crm, mi-panel)
- UX del onboarding estratégico: genera borradores pero el flujo de continuación entre fases no es fluido

### Deuda media (mejora de producto)
- Dashboards de auditorías y documentos tienen métricas básicas, faltan gráficos de tendencia
- CRM/scoring: proceso ejecutivo sin documentación interna en `content/docs/`
- Analytics de negocio: eventos PostHog instalados pero falta dashboard en super-admin
- Nosis: sin sandbox/mock para desarrollo local

### Deuda baja (futuro)
- Portal cliente dealer: `GET /api/public/solicitudes/mias` existe, falta UI en landing
- Carga de imágenes para catálogo de productos dealer
- Badge de solicitudes nuevas en el menú lateral
- Integración Don Cándido Finanzas (Fase 4)

---

## 8. Instrucciones para IAs que continúen el trabajo

### Antes de crear una API route nueva:
1. Usar `withAuth` + `resolveAuthorizedOrganizationId`
2. Validar input con Zod
3. Devolver siempre `{ success: true, data: ... }` o `{ success: false, error: '...' }`

### Antes de crear un nuevo módulo:
1. Definir el tipo en `src/types/{modulo}.ts`
2. Crear el servicio en `src/services/{modulo}/{Nombre}Service.ts`
3. Agregar el módulo a `DocModule` en `src/types/docs.ts`
4. Agregar la entrada en `MODULE_STYLES` de `src/components/docs/DocBadge.tsx`
5. Crear al menos 1 doc en `content/docs/{modulo}/vision-general.md`

### Antes de agregar docs al Manual de sistema:
1. Verificar que el módulo existe en `DocModule` (`src/types/docs.ts`)
2. Usar frontmatter completo (ver sección de docs en reporte 01)
3. Ubicar el archivo en `content/docs/{modulo}/`
4. Hacer `git add` y commitear (sin `.gitignore` activo que bloquee `.md`)

### Patrón Kanban existente:
Los Kanbans usan `FindingKanban.tsx` como referencia: columnas definidas con color CSS class, estado en `columnId`, layout flex con `flex-shrink-0 w-80`. El `UnifiedKanban` en `src/components/ui/unified-kanban.tsx` es el componente genérico.
