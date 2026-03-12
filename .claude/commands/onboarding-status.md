# /onboarding-status

Analiza el estado actual del sistema de onboarding federado y detecta gaps de implementación.

## Procedimiento

1. Leer `src/types/onboarding.ts` para las fases definidas
2. Listar todos los archivos en `src/app/api/onboarding/`
3. Por cada fase, verificar si existe un endpoint que la maneja
4. Verificar si cada endpoint valida la fase actual antes de ejecutarse
5. Buscar tests de seguridad en archivos relacionados con onboarding
6. Verificar integración con capabilities
7. Reportar estado

## Checklist de verificación

### Fases del flujo
Para cada fase en `OnboardingPhase` o equivalente:
- [ ] ¿Existe un endpoint que ejecuta la transición?
- [ ] ¿El endpoint valida que la organización esté en la fase correcta ANTES de ejecutar?
- [ ] ¿Hay un endpoint de rollback/recovery si la fase falla?
- [ ] ¿Hay tests para el endpoint de esa fase?

### Guards de seguridad
- [ ] Todos los endpoints de onboarding usan `withAuth`
- [ ] Todos usan `resolveAuthorizedOrganizationId`
- [ ] Ningún endpoint permite saltar una fase
- [ ] El estado de onboarding es inmutable (no se puede retroceder sin recovery)

### Integración con capabilities
- [ ] El provisioning instala las capabilities base correctas
- [ ] Las capabilities base están definidas en el seed
- [ ] La navegación refleja las capabilities instaladas al finalizar onboarding

### UX y ayudas
- [ ] Existe wizard o flujo de UI para cada paso
- [ ] `TourHelpButton` integrado en las pantallas del onboarding
- [ ] Existe fallback si el onboarding queda incompleto

### Métricas
- [ ] Existe logging del paso completado por organización
- [ ] Existe endpoint de métricas de onboarding en super-admin
- [ ] Se puede ver % de completitud por organización

## Formato de reporte

```
## Estado del Onboarding — [FECHA]

### Fases verificadas
| Fase | Endpoint | Guard de fase | Tests | Estado |
|------|----------|---------------|-------|--------|

### Gaps detectados
1. [gap con ruta específica si aplica]

### Endpoints existentes
- [lista de src/app/api/onboarding/*/route.ts]

### Recomendaciones
1. [acción concreta ordenada por prioridad]
```
