# Documento Técnico de Diseño: Sistema de Autorización y Visibilidad Avanzada

## 1. Modelo Conceptual de Acceso

Para `9001app-firebase`, que ya posee un esquema de `organization_id` y *capabilities* (plugins), la recomendación es implementar un **Modelo Híbrido: RBAC + ABAC (por Área) + Ownership / Asignación**.

### Justificación del Modelo Híbrido
- **RBAC (Role-Based Access Control)** puro es insuficiente porque un `jefe` de Producción vería lo mismo que un `jefe` de Mantenimiento.
- **ABAC (Attribute-Based Access Control)** puro es excesivamente complejo de gestionar para administradores pymes.
- **La solución óptima** es usar el rol (`UserRole`: `gerente`, `jefe`, `operario`, etc.) para determinar **qué acciones** puede hacer el usuario (crear, editar, aprobar), y usar el **Área/Proceso y Asignaciones** para determinar **sobre qué registros** puede ejecutar esas acciones.

### Componentes del Modelo
1. **Tenant Isolation**: Nivel 0. Todo query debe filtrarse por `organization_id`.
2. **Capability Gates**: Nivel 1. El tenant tiene el módulo activo? (Ej. `crm`). Depende de `InstalledCapability`.
3. **Rol General**: Nivel 2. Define permisos CRUD por defecto según tipo de recurso.
4. **Área Funcional**: Nivel 3. Segmenta visibilidad horizontal (Mantenimiento no ve Calidad, salvo intersecciones).
5. **Asignaciones Operativas (Ownership)**: Nivel 4. Otorga visibilidad específica independiente del área (Ej. Operario asignado a una Acción Correctiva de otra área).
6. **Agente IA Scope**: El agente hereda la conjunción de los niveles 1 al 5 al momento de construir su contexto RAG o de DB.

---

## 2. Niveles de Visibilidad Recomendados

Para aplicar el modelo híbrido, se establecen los siguientes niveles de alcance (`ScopeLevel`):

- **GLOBAL_ORG**: Acceso transversal a toda la organización. (Aplica a: `super_admin`, `admin`, `gerente` general).
- **AREA**: Visibilidad de todos los registros que pertenezcan al mismo departamento/área del usuario. (Aplica a: `jefe` de área).
- **PROCESO_VINCULADO**: Visibilidad sobre registros de procesos donde el usuario es `ownerRole` o `involvedRoles`.
- **REGISTRO_ASIGNADO**: Visibilidad exclusiva sobre el documento, hallazgo o acción directamente asignada (`assigned_to == user.uid`).
- **PROPIO (Self)**: Visibilidad únicamente de los registros creados por el usuario (`created_by == user.uid`).

### Aplicación en Módulos (Ejemplos)
- **Mi Panel**: Muestra `REGISTRO_ASIGNADO` de todos los módulos.
- **Procesos**: `jefe` ve `AREA`, `operario` ve `PROCESO_VINCULADO`.
- **CRM / Solicitudes**: `jefe` comercial ve `AREA`, `operario` (vendedor) ve `REGISTRO_ASIGNADO` y `PROPIO`.
- **Mejoras (Hallazgos/Acciones)**: Responsable de calidad ve `GLOBAL_ORG`, implicados ven `REGISTRO_ASIGNADO`.

---

## 3. Diseño de Datos en Firestore

Para mantener la arquitectura multi-tenant, todos los datos residen bajo `organizations/{orgId}` o en colecciones root con el campo `organization_id` indexado.

### Estructuras Propuestas

#### 1. Ampliación de la colección `users` (ya existente)
Actualmente tiene `rol`, se debe relacionar con áreas:
```typescript
interface UserExtension {
  // Ya existen: id, email, rol, organization_id...
  area_ids: string[]; // Referencias a áreas (para soportar multi-área)
  default_area_id: string; // Área principal
  reports_to?: string; // UID del jefe directo para escalamiento
}
```

#### 2. Subcolección `areas` bajo `organizations/{orgId}`
```typescript
interface Area {
  id: string;
  name: string;
  parent_area_id?: string; // Permite jerarquía (Ej. Ventas depende de Comercial)
  manager_id: string; // UID del jefe
}
```

#### 3. Colección raíz `resource_assignments` (Colección puente de permisos granulares)
Si no queremos ensuciar cada documento con grandes arrays de permisos:
```typescript
interface ResourceAssignment {
  id: string;
  organization_id: string;
  user_id: string;
  resource_type: 'documento' | 'hallazgo' | 'accion' | 'solicitud' | 'crm_oportunidad';
  resource_id: string;
  access_level: 'read' | 'write' | 'approve';
  source: 'direct' | 'process_role' | 'delegation'; 
}
```
*Ventaja*: Facilita buscar "todo lo que tiene asignado el usuario X" sin consultar 5 colecciones. Facilita la carga diferida para Mi Panel.

---

## 4. Relación con Navigation y Capabilities

Actualmente en `src/config/navigation.ts` y en `plugins.ts` se filtran opciones de UI. Esto **no es seguro por sí solo**.

### Propuesta Integral:
1. **Frontend (UI Hiding)**: 
   - Modificar `navigation.ts` para que evalúe no solo el módulo/feature, sino `requirePermission('modulo', 'read')` evaluando el store del usuario (que contiene su rol y áreas).
2. **Backend / Servidor de Base de Datos (Seguridad Real)**:
   - **Firestore Security Rules**: Escribir reglas que crucen el `resource.data.organization_id` y el `resource.data.area_id` con los *custom claims* del token o un documento de caché de permisos.
   - **API Routes / Edge Functions**: Todo endpoint (ej. los usados por el IA o exportaciones) debe validar mediante un middleware `withAuthorization(req, res, { resourceType: 'hallazgo', action: 'read' })`.

---

## 5. Impacto sobre el Agente IA

El agente de Don Cándido IA no puede hacer búsquedas RAG o de DB transversales a menos que el usuario sea Admin/Gerente.

### Arquitectura para el Agente: `AgentContextResolver`
Antes de que el agente ejecute una herramienta (tool) para buscar en la base de datos, el payload debe ser inyectado con el `OperationalScope` del usuario.

```typescript
interface UserOperationalScope {
  organization_id: string;
  role: UserRole;
  allowed_areas: string[];
  assigned_resource_ids: Record<string, string[]>; // { hallazgos: ['h1', 'h2'] }
  active_capabilities: string[];
}
```

**Comportamiento de la IA según Perfil:**
- **Operario**: El Prompt del sistema inyecta: *"Eres un asistente operativo. El usuario solo ve sus tareas asignadas y procesos de área [X]. Muestra respuestas directas y guíalo en la ejecución de su checklist"*.
- **Jefe**: *"Eres un asistente de mando medio. El usuario supervisa el área [X]. Prioriza mostrar cuellos de botella, métricas de su área y tareas pendientes de su equipo"*.
- **Gerente/Admin**: *"Eres un asistente ejecutivo. Muestra visión transversal de la empresa"*.

Si el IA hace un query a Firebase para leer `hallazgos`, el servicio de base de datos intercepta y automáticamente filtra `where("area_id", "in", scope.allowed_areas)`.

---

## 6. Reglas de Autorización por Tipo de Recurso (Matriz Conceptual)

| Recurso | Visibilidad Base | Edición | Aprobación | Administración |
|---------|------------------|---------|------------|----------------|
| **Proceso** | `PROCESO_VINCULADO` u `ORG` | `ownerRole` / `Jefe` área | `Responsable Calidad` | `Admin` |
| **Documento** | Según política del Doc o `AREA` | Elaborador asignado | Revisor/Aprobador | `Admin` |
| **Hallazgo/Acción** | `AREA` o Implicados | Asignado a resolver | Auditor / Jefe Área | `Res. Calidad` |
| **Solicitud Dealer** | Comercial / Postventa | Repuestos / Taller (si asignado) | `Gerente` | `Admin` |
| **Oportunidad CRM** | `AREA` Ventas | Vendedor asignado (`PROPIO`) | `Jefe Ventas` | `Admin` |
| **Dashboard** | `AREA` respectiva | N/A | N/A | `Admin` |

---

## 7. Casos Especiales Importantes

1. **Usuarios Multi-Área**: Soportados nativamente al usar `area_ids: string[]`. El scope inyecta ambas áreas en las cláusulas `IN` de las consultas.
2. **Reemplazo Temporal / Delegación**: En la colección `resource_assignments`, se añade un registro con `source: 'delegation'` y una fecha de expiración temporal.
3. **Acceso por Excepción**: Un gerente invita a alguien de Producción a ver un documento de Finanzas. Se añade un `ResourceAssignment` puntual al `document_id` para ese `user_id`.
4. **Futuros Plugins**: Todo nuevo plugin debe definir en su manifest qué tipo de visibilidad usa (Ej. `visibility_strategy: 'area_based'`).

---

## 8. Arquitectura Técnica Recomendada

Se propone implementar los siguientes constructores dentro de `src/`:

### Servidor / Lógica (API, Server Actions)
- `src/services/auth/VisibilityScopeService.ts`: Genera el `UserOperationalScope` combinando rol, área y tenencia.
- `src/services/auth/withAuthorization.ts`: Middleware/Wrapper para Next.js API Routes / Server Actions que rechaza peticiones no autorizadas.
- `src/services/ai/AgentScopeResolver.ts`: Modificador del Context Prompt y de las Tools que asegura que el modelo de lenguaje solo consulte en el scope del usuario.

### Cliente / UI (React)
- `src/hooks/useAuthorization.ts`: Hook que consume contexto para devolver booleanos: `const canEdit = useAuthorization('accion_correctiva', 'edit', record);`.
- `<ProtectedRoute>` / `<VisibleWhen>`: Componente Wrapper para renderizar botones ("Editar", "Borrar") solo si hay permisos.

---

## 9. Estrategia de Implementación por Etapas

Para no romper el entorno en producción, se realizará progresivamente:

- **Etapa 1: Base de Datos y Tipos**. Añadir interfaz `Area`, expandir tipo `User` con `area_ids`, y crear subcolección `areas` en organizaciones.
- **Etapa 2: Servicios Base**. Implementar `VisibilityScopeService` y middleware de backend, inicialmente en "modo auditoría" (solo loguea bloqueos, no bloquea).
- **Etapa 3: Migración CRM y Solicitudes**. Al ser los más sensibles a privacidad horizontal, aplicar las reglas primero aquí. Refactorizar UI para ocultar registros ajenos.
- **Etapa 4: Migración Mi Panel y Procesos**. Reescritura de los queries de Mi Panel para usar el servicio de Scope centralizado.
- **Etapa 5: Contexto Restringido en IA**. Actualizar el orquestador de Don Cándido IA con el `AgentScopeResolver` y actualizar los prompts.
- **Etapa 6: Cierre de Seguridad**. Configurar las Firestore Security Rules definitivas y activar el bloqueo en el backend.

---
*Este documento establece las bases para el inicio de la programación en tareas subsiguientes.*
