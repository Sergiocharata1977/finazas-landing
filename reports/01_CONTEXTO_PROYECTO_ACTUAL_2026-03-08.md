# 01 — Contexto y filosofía del sistema

**Fecha:** 2026-03-08
**Proyecto principal:** `9001app-firebase`
**Dominio de producción:** `doncandidoia.com`

---

## 1. Qué es este sistema y para qué existe

`9001app-firebase` es la plataforma central de **Don Cándido IA**. No es un prototipo ni un MVP en construcción: es un SaaS multi-tenant real y operativo que ya tiene clientes activos.

El nombre histórico refleja el origen: empezó como herramienta de gestión de calidad bajo norma ISO 9001. Con el tiempo evolucionó hacia una plataforma federada que hoy combina cuatro capas:

1. **Sistema de gestión y cumplimiento normativo** (ISO 9001, auditorías, hallazgos, acciones correctivas, documentos, RRHH)
2. **Motor de operación comercial** (CRM, oportunidades, scoring crediticio, clientes, contactos)
3. **Capa de automatización e IA** (asistente omnicanal, WhatsApp, voz, chat, prompts versionados, LLMRouter multi-provider)
4. **Framework de expansión por verticales** (capabilities/plugins activables por organización, módulos premium, integraciones dealer)

**La filosofía central es:** una sola base de código, muchas organizaciones, cada una con sus propios módulos activos. No se instala software diferente por cliente: se activan capabilities en Firestore.

---

## 2. Arquitectura de tres proyectos

El ecosistema completo tiene tres proyectos Next.js desplegados en Vercel, cada uno con su dominio:

### 9001app-firebase (este repositorio)
- **Dominio:** `doncandidoia.com`
- **Rol:** backoffice operativo, APIs privadas y públicas, IA, Firestore, documentación interna
- **Quien accede:** empleados internos de cada organización, administradores, el asistente IA

### Landing-Agrobiciufa
- **Dominio:** `landing-agrobiciufa.vercel.app`
- **Rol:** web pública del concesionario Agro Biciufa (CASE IH), formularios de contacto
- **Quien accede:** clientes finales del concesionario. Sin login para el MVP.
- **Relación con 9001app:** consume `GET /api/public/productos` y `POST /api/public/solicitudes`

### don-candido-finanzas
- **Dominio:** propio (fase futura)
- **Rol:** módulo de créditos y cuenta corriente para concesionarios
- **Estado:** reservado para Fase 4. NO integrado en el MVP actual.

---

## 3. Stack técnico completo

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14.2.18 con App Router |
| Lenguaje | TypeScript strict |
| UI | React 18, Tailwind CSS, Radix UI, Framer Motion |
| Base de datos | Firebase Firestore (multi-tenant) |
| Autenticación | Firebase Auth |
| Storage | Firebase Storage |
| Admin SDK | firebase-admin 13.5 |
| Validaciones | Zod |
| Forms | React Hook Form |
| IA principal | Claude SDK 0.67 (Anthropic) |
| IA fallback | Groq SDK + OpenAI SDK |
| Observabilidad | Sentry (triple config: server/client/edge) |
| Analytics | PostHog (eventos de producto) |
| Mobile | Capacitor (Android) |
| Tests | Jest + Playwright |
| CI | GitHub Actions |
| Deploy | Vercel |

---

## 4. Modelo de datos multi-tenant en Firestore

Todo vive bajo `organizations/{orgId}`. Cada organización es un tenant aislado.

```
organizations/
  {orgId}/
    nombre, slug, activo, whatsapp_notificaciones_dealer, public_api_key

    capabilities/
      {capabilityId}/
        activo: true
        installedAt: timestamp

    procesos/
    documentos/
    auditorias/
    hallazgos/
    acciones/
    personal/
    formaciones/
    clientes/
    contactos/
    oportunidades/
    solicitudes/          ← nuevo módulo dealer
    productos/            ← catálogo dealer
    kanban_config/        ← configuración de columnas Kanban por módulo
    conversaciones/       ← historial IA por usuario
```

El `orgId` nunca se confía del cliente. Se resuelve siempre desde el token de autenticación de Firebase Auth, usando `resolveAuthorizedOrganizationId()` en `src/middleware/verifyOrganization.ts`.

---

## 5. Módulos principales del sistema

### Núcleo de plataforma
- Autenticación y autorización multi-tenant con roles: `super_admin`, `admin`, `gerente`, `jefe`, `usuario`
- Scoping por organización (toda API usa `resolveAuthorizedOrganizationId`)
- Navegación dinámica controlada por capabilities activas
- Documentación interna in-app (Manual de sistema) con 37 docs MD en `content/docs/`

### Gestión ISO 9001
- **Mi SGC:** dashboard de cumplimiento por cláusula
- **Procesos y SIPOC:** mapa de procesos, indicadores, objetivos
- **Documentos:** ciclo de vida, versiones, aprobación
- **Auditorías:** planificación, ejecución, cierre, tablero Kanban
- **Hallazgos y NC:** registro, análisis, clasificación (NC/OBS), Kanban de estados
- **Acciones correctivas:** 4 fases (registro, acción inmediata, ejecución, análisis), Kanban
- **RRHH:** personal, formaciones, evaluaciones, cadena organizacional
- **Mi Panel:** asignaciones unificadas de tareas del usuario

### Módulos premium (activados por capability)
- **ISO 8.3 Diseño:** gestión de proyectos de diseño y desarrollo
- **ISO 7.1.3 Infraestructura:** registro y mantenimiento de infraestructura

### Capa comercial
- **CRM:** clientes, contactos, oportunidades, pipeline Kanban configurable
- **Scoring crediticio:** evaluación de riesgo, líneas de crédito, integración Nosis
- **Módulo Dealer:** solicitudes externas (repuesto/servicio/comercial), catálogo productos

### Capa de IA y automatización
- **Don Cándido IA:** asistente omnicanal unificado bajo `UnifiedConverseService`
- **Canales:** chat web, WhatsApp, voz
- **LLMRouter:** Claude como primario, Groq como fallback
- **WhatsApp:** notificaciones operativas via Twilio (solicitudes, cambios de estado)

---

## 6. Sistema de Capabilities (plugins)

Este es el mecanismo de extensión central. En lugar de código condicional hardcodeado, cada módulo premium o vertical se activa/desactiva en Firestore.

**Cómo funciona:**

1. En Firestore: `organizations/{orgId}/capabilities/{capabilityId}` con `activo: true`
2. En código: `requireCapability('dealer_solicitudes', orgId)` en el servidor
3. En navegación: `feature: 'dealer_solicitudes'` en `src/config/navigation.ts` oculta/muestra ítems
4. En frontend: `useCapability('dealer_solicitudes')` para ocultar/mostrar UI

**Capabilities actuales:**
- `dealer_solicitudes` — módulo dealer Agro Biciufa
- `iso_design` — ISO 8.3 Diseño
- `iso_infra` — ISO 7.1.3 Infraestructura
- `crm_scoring` — scoring crediticio avanzado

---

## 7. Patrones de seguridad estandarizados

Todo el código nuevo DEBE seguir estos patrones:

```typescript
// 1. Wrapper de autenticación
const handler = withAuth(async (req, context) => {
  // context.user.uid, context.user.role disponibles
}, { roles: ['admin', 'gerente'] });

// 2. Scoping por organización (NUNCA confiar orgId del cliente)
const orgId = await resolveAuthorizedOrganizationId(req, context.user);

// 3. Errores de organización tipados
if (!orgId) return toOrganizationApiError('ORG_NOT_FOUND');
```

**Archivos clave:**
- `src/lib/api/withAuth.ts` — wrapper de autenticación
- `src/middleware/verifyOrganization.ts` — `resolveAuthorizedOrganizationId`
- `src/middleware.ts` — gate global (Bearer/cookie)
- `firestore.rules` — reglas multi-tenant, funciones `isAdmin()`, `isManager()`, `belongsToOrganization()`

---

## 8. Sistema documental in-app

Los documentos del Manual de sistema no están en base de datos: viven en archivos MD en `content/docs/` en el repositorio.

**Por qué:** velocidad de acceso, versionado con git, sin queries de BD para leer documentación, Vercel los incluye en el bundle serverless vía `outputFileTracingIncludes`.

**Estructura:**
```
content/docs/
  {modulo}/
    vision-general.md
    {flujo-especifico}.md
```

**Frontmatter requerido:**
```yaml
---
title: "Título del documento"
module: "dealer"           # debe coincidir con DocModule en src/types/docs.ts
category: "usuario"        # usuario | tecnico | proceso
slug: "dealer/mi-doc"
tags: ["dealer", "solicitudes"]
order: 10
status: "active"
---
```

**Loader:** `src/lib/docs/loader.ts` — lee filesystem, no usa base de datos, no filtra por org.

---

## 9. Proyecto Agro Biciufa como caso de uso modelo

El caso del concesionario Agro Biciufa (CASE IH) ilustra el modelo de expansión del sistema:

- La landing pública captura solicitudes (repuesto, servicio técnico, consulta comercial)
- Las solicitudes llegan a 9001app por API pública (`POST /api/public/solicitudes`)
- El operario las gestiona en el panel interno (`/solicitudes`)
- WhatsApp notifica automáticamente al operario y al cliente
- Las consultas comerciales se sincronizan con el CRM
- El catálogo de productos se gestiona desde el backoffice y se expone en la landing

**Conclusión para otras IAs:** Este caso confirma que 9001app es el backoffice y cerebro operativo de cualquier vertical o canal externo. No se construye un sistema separado por cliente: se activan capabilities y se configuran en Firestore.

---

## 10. Principios de diseño del sistema

1. **Multi-tenant primero:** todo scoping por orgId, nunca datos de distintas orgs mezclados
2. **Capabilities sobre flags:** no hay `if (isAgrobiciufa)` en el código; hay capabilities
3. **APIs tipadas con Zod:** toda entrada validada en el servidor
4. **Fire-and-forget para efectos secundarios:** WhatsApp, analytics, sync CRM nunca bloquean la respuesta HTTP
5. **Filesystem para docs:** no Firestore para documentación interna
6. **Un solo endpoint de IA:** `UnifiedConverseService` es el único punto de entrada a la inteligencia, sin importar el canal
7. **Seguridad por defecto:** `withAuth` + `resolveAuthorizedOrganizationId` en toda API privada
