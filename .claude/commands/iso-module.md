# /iso-module

Scaffolding de un nuevo módulo ISO siguiendo los patrones establecidos del proyecto.

## Argumentos

`$ARGUMENTS` — descripción del módulo a crear. Incluir:
- Nombre del módulo (ej: `iso-8-3`, `iso-7-1-3`)
- Descripción breve (ej: "Diseño y Desarrollo de Productos")
- Capability asociada (ej: `iso-design-development`)

Ejemplo: `nombre=iso-8-3 descripcion="Diseño y Desarrollo" capability=iso-design-development`

## Procedimiento

1. Verificar que el módulo NO exista ya (evitar duplicados)
2. Leer un módulo ISO existente como referencia (ej: `src/app/api/audits/` o `src/app/api/actions/`)
3. Crear los archivos en este orden:
   a. Tipos TypeScript
   b. Schema Zod de validación
   c. API route con withAuth
   d. Skeleton de componente de lista
   e. Entrada en Firestore rules (describir el cambio, no editar directamente)
   f. Documento en content/docs/ con /add-doc

## Archivos a crear

```
src/
  types/
    [nombre-modulo].ts           ← Tipos TypeScript del módulo
  lib/
    validations/
      [nombre-modulo].ts         ← Schema Zod
  app/
    api/
      [nombre-modulo]/
        route.ts                 ← GET/POST con withAuth + org scoping
        [id]/
          route.ts               ← GET/PUT/DELETE por ID
    (dashboard)/
      [nombre-modulo]/
        page.tsx                 ← Página del módulo (stub básico)
```

## Patrones obligatorios

### types/[nombre].ts
```typescript
// Referencia: src/types/audits.ts o src/types/actions.ts
export interface [NombreEntidad] {
  id: string;
  organizationId: string;  // SIEMPRE
  // ... campos del módulo
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### api/[nombre]/route.ts
```typescript
// Referencia: src/app/api/audits/route.ts
import { withAuth } from '@/lib/auth/withAuth';
import { resolveAuthorizedOrganizationId } from '...';

export const GET = withAuth(async (req, context) => {
  const orgId = await resolveAuthorizedOrganizationId(req, context);
  // ... lógica con orgId
}, { roles: ['admin', 'gerente', 'auditor'] });
```

### Firestore rules (describir el cambio a agregar)
```
// Agregar en firestore.rules:
match /[nombre-coleccion]/{docId} {
  allow read: if isAuthenticated() && resourceBelongsToUserOrg();
  allow create: if isAuthenticated() && isManager() && incomingResourceBelongsToUserOrg();
  allow update: if isAuthenticated() && isManager() && resourceBelongsToUserOrg();
  allow delete: if isAuthenticated() && isAdmin() && resourceBelongsToUserOrg();
}
```

## Checklist de completitud

- [ ] Tipos TypeScript creados
- [ ] Schema Zod de validación creado
- [ ] API route GET (lista) con withAuth + org scoping
- [ ] API route GET/PUT/DELETE por ID
- [ ] Página del módulo (skeleton básico)
- [ ] Cambio de Firestore rules documentado
- [ ] Documento en content/docs/ creado (usar /add-doc)
- [ ] Capability premium definida (si aplica)
