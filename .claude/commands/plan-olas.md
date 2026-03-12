# Skill: /plan-olas

Genera un plan de ejecución multi-agente en olas para un feature o tarea compleja.
Produce un documento MD estructurado con prompts listos para ejecutar en paralelo.

## Reglas del sistema de olas

### Numeración
- **Ola 1:** agentes 1A, 1B, 1C... → se ejecutan en PARALELO simultáneamente
- **Ola 2:** agentes 2A, 2B, 2C... → se ejecutan en PARALELO, pero DESPUÉS de que ola 1 complete
- **Ola 3:** agentes 3A, 3B... → depende de ola 2
- La letra (A, B, C) = agente dentro de la ola. El número = orden de la ola.

### Reglas de independencia (CRÍTICAS)
1. Todos los agentes de una misma ola deben ser **completamente independientes entre sí**
   - No pueden leer archivos que otro agente de la misma ola está escribiendo
   - No pueden modificar el mismo archivo
2. Un agente de ola 2 puede leer archivos creados por agentes de ola 1
3. Cada prompt de agente debe ser **autocontenido**: incluye todo el contexto que el agente necesita para trabajar sin preguntar
4. Si dos tareas dependen entre sí → van en olas distintas (no en la misma)

### Formato obligatorio de cada agente

Cada bloque de agente SIEMPRE tiene estas secciones en este orden:

```
## Agente [NúmeroLetra] — [Nombre descriptivo]
**Puede ejecutarse en paralelo con:** [lista de agentes de la misma ola, o "ninguno" si es único]
**Depende de:** [agentes de ola anterior que deben completar primero, o "nada"]

### Objetivo
[Una oración clara: qué crea o modifica este agente]

### Archivos a crear
- `ruta/exacta/del/archivo.ts` — descripción de qué hace

### Archivos a modificar
- `ruta/exacta/del/archivo.ts` — qué cambio específico hace

### Prompt completo para el agente
[El prompt que se le pasa al agente. Debe incluir:]
- Contexto del proyecto (stack, patrones usados)
- Referencias a archivos existentes que debe leer como modelo
- Qué exactamente debe implementar (con tipos, firmas de función si aplica)
- Qué NO debe hacer (límites del scope)
- Cómo sabe que terminó bien (criterio de éxito)
```

### Estructura del documento de plan

```markdown
# Plan [NombreFeature] — Ejecución multi-agente

**Fecha:** YYYY-MM-DD
**Feature:** descripción en una línea
**Proyectos afectados:** lista de repos

---

## Resumen de olas

| Ola | Agentes | Pueden ejecutarse en paralelo | Dependen de |
|-----|---------|------------------------------|-------------|
| 1 | 1A, 1B, 1C | Sí (entre ellos) | Nada |
| 2 | 2A, 2B | Sí (entre ellos) | Ola 1 completa |
| 3 | 3A | No aplica (único) | Ola 2 completa |

---

## Ola 1 — [Nombre de la ola]
> Ejecutar 1A + 1B + 1C en PARALELO

[bloques de cada agente]

---

## Ola 2 — [Nombre de la ola]
> Ejecutar solo después de que OLA 1 esté completa
> Ejecutar 2A + 2B en PARALELO

[bloques de cada agente]

---

## Verificación final
[Checklist manual para confirmar que todo funciona]
```

---

## Tarea

Analiza el feature solicitado y produce el documento MD completo siguiendo el formato de arriba.

El feature a planificar es: $ARGUMENTS

Si no se especifica un feature, pregunta cuál es el feature antes de continuar.

**Consideraciones al dividir en olas:**
- Backend (types, services, API routes) → generalmente ola 1
- Frontend (páginas, componentes) → generalmente ola 2 (depende del backend)
- Tests e integración → generalmente ola 3
- Si un componente usa un tipo definido en otra tarea → van en olas distintas

**Sobre los prompts de cada agente:**
- Deben ser lo suficientemente detallados para que un agente frío (sin contexto previo) pueda ejecutarlos
- Incluir siempre: stack del proyecto, ruta de archivos modelo a copiar, tipos exactos si aplica
- El agente no debe necesitar preguntar nada
