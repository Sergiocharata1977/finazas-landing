# /check-capability

Verifica que una capability del sistema está correctamente implementada y gateada.

## Argumentos

`$ARGUMENTS` — nombre de la capability a verificar (ej: `crm-risk-scoring`, `iso-core`, `whatsapp-integration`)

## Procedimiento

1. Buscar la capability en el seed de capabilities
2. Verificar APIs y rutas asociadas
3. Verificar el gating en `withAuth` o middleware
4. Verificar la entrada en la navegación dinámica
5. Reportar estado

## Checklist

### 1. Definición en catálogo
- [ ] Existe en `platform_capabilities` (buscar en seed scripts o types)
- [ ] Tiene `id`, `name`, `description`, `system` definidos
- [ ] Tiene `datasets` y `navigation_entries` configurados

### 2. Gating en API routes
- [ ] Las rutas asociadas verifican que la capability esté instalada
- [ ] `withAuth` incluye check de capability o hay guard explícito
- [ ] Usuario sin capability activa recibe 403, no datos vacíos

### 3. Navegación dinámica
- [ ] Existe en `mergeNavigationWithPluginEntries()` o equivalente
- [ ] La entrada de sidebar solo aparece si la capability está activa
- [ ] `USE_DYNAMIC_NAV` está activo (o hay un plan para activarlo)

### 4. Firestore rules
- [ ] Los datos de la capability están protegidos por `belongsToOrganization`
- [ ] No hay acceso cross-org a datos de esta capability

## Formato de reporte

```
## Verificación capability: [NOMBRE]

### Estado general: ✅ COMPLETA / ⚠️ PARCIAL / ❌ INCOMPLETA

### Definición en catálogo
- Estado: [OK / FALTA]
- Archivo: [ruta si existe]

### Gating en APIs
- Rutas encontradas: [lista]
- Guard implementado: [SÍ / NO / PARCIAL]

### Navegación dinámica
- Entrada en sidebar: [SÍ / NO]
- Activada con USE_DYNAMIC_NAV: [SÍ / NO]

### Hallazgos y recomendaciones
1. [acción concreta]
```

## Archivos de referencia del proyecto

- Seed de capabilities: buscar en `src/lib/seed/` o `scripts/`
- Tipos de capability: `src/types/` (buscar capability o plugin)
- Navegación dinámica: buscar `mergeNavigationWithPluginEntries`
- Flag de activación: buscar `USE_DYNAMIC_NAV` en el código
