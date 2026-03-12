# Federación Don Cándido Finanzas

Fecha: 2026-03-10
Repositorio: `don-candido-finanzas - copia`

## Objetivo

Dejar esta copia como base federada del producto financiero, usando la infraestructura técnica de `9001app-firebase` pero cambiando el foco de producto.

## Qué se hizo

1. Se copió la carpeta `reports` desde el repo base.
2. Se replicó el código fuente y configuración útil del repo federado.
3. Se dejó este repo listo para seguir evolucionando directamente acá.
4. Se reescribió `README.md` con foco en Don Cándido Finanzas.
5. Se agregó un módulo de navegación explícito para finanzas.

## Criterio de federación

Este proyecto no debe eliminar de golpe todo lo heredado del ecosistema. El criterio correcto es:

- conservar infraestructura reutilizable
- consolidar primero el núcleo financiero
- desacoplar después módulos ISO no necesarios

## Qué sigue pendiente

1. Reducir navegación heredada de ISO cuando ya existan pantallas financieras propias.
2. Crear páginas de backoffice financiero:
- operaciones
- préstamos
- cuotas
- recibos
- cuenta corriente

3. Mover configuración contable a reglas parametrizables.
4. Dejar pagos web para la última etapa, según decisión actual.

## Veredicto

La federación técnica tiene sentido. La base heredada aporta:

- autenticación
- tenancy
- CRM
- APIs
- storage
- trazabilidad

Pero el producto debe reorientarse explícitamente a finanzas. Desde este punto, el criterio de trabajo pasa a ser:

- primero núcleo financiero
- después desacople visual, funcional y narrativo del stack ISO
