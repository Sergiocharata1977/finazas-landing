---
title: "Uso del asistente IA Don Candido"
slug: "don-candido/asistente-ia"
module: "don-candido"
screen: "/historial-conversaciones"
summary: "Explica como iniciar conversaciones con Don Candido IA y en que contextos del sistema puede apoyar al usuario."
roles: ["admin", "gerente", "auditor", "jefe", "usuario"]
tags: ["don-candido", "ia", "chat"]
relatedRoutes: ["/historial-conversaciones", "/api/chat/sessions", "/api/chat/messages"]
entity: "chat_session"
order: 10
status: "active"
category: "usuario"
lastValidated: "2026-03-04"
---

## Que es

Don Candido es el asistente IA integrado al sistema para ayudar con consultas operativas y de contexto. En el codigo actual aparece como una experiencia de chat con sesiones, mensajes, seleccion de modo de respuesta y modulo activo detectado segun la ruta. Tambien existe integracion parcial dentro de Mi Panel mediante componentes de historial y centro IA.

La ruta `/historial-conversaciones` redirige a `/mi-panel?tab=chat`, por lo que el acceso formal al historial y a la experiencia conversacional depende hoy de esa integracion. [VERIFICAR]

## Para que sirve

Sirve para resolver dudas de uso, pedir orientacion sobre modulos como auditorias, hallazgos o acciones, y mantener conversaciones dentro de un contexto relacionado con la pantalla actual. El sistema identifica el modulo segun la ruta para dar respuestas mas ubicadas.

Tambien permite crear y reutilizar sesiones de chat, lo que evita perder continuidad entre consultas relacionadas.

## Como se usa

Abre el acceso disponible a Don Candido y espera a que el sistema cree o seleccione una sesion. Luego escribe tu consulta y envia el mensaje. La aplicacion usa endpoints como `/api/chat/sessions` y `/api/chat/messages` para registrar la conversacion. Si estas trabajando dentro de un modulo especifico, el chat toma ese contexto automaticamente.

En algunas vistas puedes alternar entre modos de respuesta y revisar sesiones anteriores desde el panel lateral. Si necesitas continuidad, conserva la misma sesion en lugar de abrir una nueva para cada pregunta.

## Errores frecuentes

- Usar una sesion nueva para cada consulta breve, perdiendo contexto acumulado.
- Hacer preguntas ambiguas sin mencionar proceso, modulo o problema concreto.
- Asumir que el historial tiene pagina propia independiente cuando hoy redirige a Mi Panel. [VERIFICAR]

## Documentos relacionados

- [Historial de conversaciones](./historial-de-conversaciones.md)
- [Modos de respuesta](./modos-de-respuesta.md)
- [Vision general de Mi Panel](../mi-panel/vision-general.md)
