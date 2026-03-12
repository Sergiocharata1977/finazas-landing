# Reporte de cierre — Subflujo crediticio y navegación

**Fecha:** 2026-03-09  
**Proyecto:** `9001app-firebase`  
**Estado:** Cerrado a nivel de planificación ejecutada + cierre de Ola 7

---

## 1. Alcance consolidado

Durante este frente se trabajó sobre cuatro líneas que terminaron convergiendo:

- Separación operativa de `solicitudes`
- Portal cliente autenticado ligado a CRM
- Subflujo crediticio integrado a oportunidades CRM
- Reorganización final de navegación y validación estructural

---

## 2. Hallazgos que corrigieron el rumbo

### 2.1 Solicitudes no debía seguir como tablero único

Se detectó que `repuesto`, `servicio` y `comercial` estaban mezclados en un único tablero operativo.

Decisión tomada:

- `comercial` pertenece al proceso principal de `CRM / Oportunidades`
- `/solicitudes` debe quedar enfocado en procesos operativos no comerciales
- la estructura se separó conceptualmente en:
  - `Repuestos`
  - `Servicios`

### 2.2 El portal cliente CRM requería identidad explícita

Se verificó que ya existían:

- `tenant_slug`
- APIs públicas por tenant
- login público por Firebase
- endpoint `solicitudes/mias`

Pero no existía vínculo formal entre:

- usuario autenticado de la web pública
- cliente CRM concreto del tenant

Decisión tomada:

- modelar identidad de portal-cliente como frente propio
- no asumir que `organization_id + email` resuelve por sí solo el portal CRM

---

## 3. Resultado funcional consolidado

### 3.1 CRM y Gestión Crediticia

El proyecto quedó estructurado para que:

- `CRM / Ventas` sea el flujo comercial principal
- `Gestión Crediticia` exista como proceso hermano
- el subflujo crediticio quede visible sin romper la continuidad comercial

### 3.2 Navegación del sistema

Se cerró la Ola 7 reorganizando la navegación principal en cuatro bloques:

- `Direccion`
- `Procesos Operativos`
- `Procesos de Apoyo`
- `Configuracion`

También se alineó el sidebar propio de CRM para que `CRM / Ventas` y `Gestion Crediticia` queden visibles como procesos hermanos dentro del módulo.

---

## 4. Cambios técnicos realizados en el cierre

### Archivos modificados en Ola 7

- `src/config/navigation.ts`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/CRMSidebar.tsx`

### Cambios concretos

- la navegación principal pasó a estar agrupada por bloques de negocio;
- `Gestion Crediticia` quedó integrada en `Procesos Operativos`;
- el menú móvil ahora reconoce rutas hijas con `startsWith(...)` y expande automáticamente el grupo activo;
- el sidebar propio de CRM ahora incluye:
  - `CRM / Ventas`
  - `Gestion Crediticia`

---

## 5. Validación ejecutada

Se ejecutó:

```bash
npm run type-check
```

Resultado:

- `OK`
- sin errores TypeScript al cierre de esta etapa

---

## 6. Estado final de reports

Se conservaron:

- `11_INVENTARIO_FUNCIONAL_PORTAL_CLIENTE_CRM_2026-03-09.md`
- `12_PLAN_MAPA_PROCESOS_2026-03-09.md`
- `13_REPORTE_MAPA_PROCESOS_2026-03-09.md`

Motivo:

- `11` es un reporte/inventario útil
- `12` y `13` siguen en trabajo con otro agente

Se eliminaron los documentos de planificación/compaginación de este frente para evitar ruido operativo.

---

## 7. Cierre

Este frente queda cerrado con:

- planes ejecutados y consolidados;
- navegación final reorganizada;
- documentación de cierre en `reports/`;
- limpieza de documentos de coordinación ya agotados.

El siguiente trabajo ya no debería retomar estos planes de coordinación, sino partir del estado real del código y de este reporte de cierre.
