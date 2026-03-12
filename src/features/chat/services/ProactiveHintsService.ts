// ============================================
// SERVICIO DE SUGERENCIAS PROACTIVAS
// ============================================
// Don Cándido analiza el estado del sistema y sugiere el próximo paso

import {
  FASES_ISO_9001,
  PhaseProgress,
} from '@/features/journey/types/journey';

export interface ProactiveSuggestion {
  id: string;
  tipo: 'siguiente_paso' | 'recordatorio' | 'felicitacion' | 'alerta';
  titulo: string;
  mensaje: string;
  accion?: {
    texto: string;
    ruta: string;
  };
  prioridad: 'alta' | 'media' | 'baja';
  icono: string;
}

/**
 * Servicio para generar sugerencias proactivas de Don Cándido
 */
export class ProactiveHintsService {
  /**
   * Generar sugerencias basadas en el progreso del journey
   */
  static getSuggestionsByJourney(
    faseActual: number,
    progress: PhaseProgress[],
    tareasCompletadasHoy: number = 0
  ): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];

    const currentPhase = FASES_ISO_9001.find(f => f.id === faseActual);
    const currentProgress = progress.find(p => p.phaseId === faseActual);

    if (!currentPhase || !currentProgress) {
      // Sin progreso - sugerir empezar
      suggestions.push({
        id: 'start-journey',
        tipo: 'siguiente_paso',
        titulo: '¡Comienza tu camino a ISO 9001!',
        mensaje:
          'Aún no has iniciado el proceso de implementación. El primer paso es realizar un diagnóstico de tu organización.',
        accion: { texto: 'Ir a Mi Certificación', ruta: '/journey' },
        prioridad: 'alta',
        icono: '🚀',
      });
      return suggestions;
    }

    // Calcular tareas pendientes de la fase actual
    const tareasRequeridas = currentPhase.tareas.filter(t => t.esRequerida);
    const tareasCompletadas = currentProgress.tareasCompletadas.length;
    const tareasPendientes = tareasRequeridas.length - tareasCompletadas;

    // Sugerencia del próximo paso
    if (tareasPendientes > 0) {
      const siguienteTarea = tareasRequeridas.find(
        t => !currentProgress.tareasCompletadas.includes(t.id)
      );

      if (siguienteTarea) {
        suggestions.push({
          id: 'next-task',
          tipo: 'siguiente_paso',
          titulo: `Próximo paso: ${siguienteTarea.titulo}`,
          mensaje: siguienteTarea.descripcion,
          accion: siguienteTarea.rutaModulo
            ? {
                texto: `Ir a ${siguienteTarea.moduloVinculado}`,
                ruta: siguienteTarea.rutaModulo,
              }
            : {
                texto: 'Ver detalle de la fase',
                ruta: `/journey/${faseActual}`,
              },
          prioridad: 'alta',
          icono: currentPhase.icono,
        });
      }
    } else {
      // Fase completa
      const siguienteFase = FASES_ISO_9001.find(f => f.id === faseActual + 1);
      if (siguienteFase) {
        suggestions.push({
          id: 'phase-complete',
          tipo: 'felicitacion',
          titulo: `¡Fase ${faseActual} completada!`,
          mensaje: `Has completado "${currentPhase.nombre}". Ahora puedes continuar con "${siguienteFase.nombre}".`,
          accion: {
            texto: 'Comenzar siguiente fase',
            ruta: `/journey/${siguienteFase.id}`,
          },
          prioridad: 'alta',
          icono: '🎉',
        });
      } else {
        // Última fase completada
        suggestions.push({
          id: 'ready-certification',
          tipo: 'felicitacion',
          titulo: '¡Listo para certificación!',
          mensaje:
            'Has completado todas las fases de implementación. Ya puedes contactar a un organismo certificador.',
          prioridad: 'alta',
          icono: '🏆',
        });
      }
    }

    // Felicitación por productividad
    if (tareasCompletadasHoy >= 3) {
      suggestions.push({
        id: 'productivity',
        tipo: 'felicitacion',
        titulo: '¡Excelente progreso hoy!',
        mensaje: `Has completado ${tareasCompletadasHoy} tareas hoy. Sigue así para mantener el ritmo.`,
        prioridad: 'baja',
        icono: '⭐',
      });
    }

    // Recordatorio si el progreso es bajo
    if (currentProgress.porcentaje < 30 && currentProgress.porcentaje > 0) {
      suggestions.push({
        id: 'low-progress',
        tipo: 'recordatorio',
        titulo: 'Mantén el impulso',
        mensaje: `Llevas ${currentProgress.porcentaje}% de la fase ${faseActual}. Dedicar 30 minutos al día te ayudará a avanzar rápido.`,
        accion: { texto: 'Continuar', ruta: `/journey/${faseActual}` },
        prioridad: 'media',
        icono: '💪',
      });
    }

    return suggestions;
  }

  /**
   * Generar sugerencias basadas en módulos pendientes
   */
  static getSuggestionsByModules(stats: {
    documentosPendientes?: number;
    hallazgosAbiertos?: number;
    accionesPendientes?: number;
    auditoriasPlaneadas?: number;
    capacitacionesPendientes?: number;
  }): ProactiveSuggestion[] {
    const suggestions: ProactiveSuggestion[] = [];

    if (stats.hallazgosAbiertos && stats.hallazgosAbiertos > 0) {
      suggestions.push({
        id: 'open-findings',
        tipo: 'alerta',
        titulo: `${stats.hallazgosAbiertos} hallazgos abiertos`,
        mensaje:
          'Tienes hallazgos que requieren atención. Revísalos y crea acciones correctivas.',
        accion: { texto: 'Ver hallazgos', ruta: '/hallazgos' },
        prioridad: 'alta',
        icono: '⚠️',
      });
    }

    if (stats.accionesPendientes && stats.accionesPendientes > 0) {
      suggestions.push({
        id: 'pending-actions',
        tipo: 'recordatorio',
        titulo: `${stats.accionesPendientes} acciones pendientes`,
        mensaje: 'Hay acciones correctivas que necesitan seguimiento.',
        accion: { texto: 'Ver acciones', ruta: '/acciones' },
        prioridad: 'media',
        icono: '📋',
      });
    }

    if (stats.documentosPendientes && stats.documentosPendientes > 0) {
      suggestions.push({
        id: 'pending-docs',
        tipo: 'recordatorio',
        titulo: `${stats.documentosPendientes} documentos en borrador`,
        mensaje: 'Tienes documentos que necesitan aprobación.',
        accion: { texto: 'Ver documentos', ruta: '/documentos' },
        prioridad: 'baja',
        icono: '📝',
      });
    }

    return suggestions;
  }

  /**
   * Generar mensaje de bienvenida contextual para Don Cándido
   */
  static getContextualGreeting(
    userName: string,
    faseActual: number,
    horaActual: number = new Date().getHours()
  ): string {
    const saludo =
      horaActual < 12
        ? '¡Buenos días'
        : horaActual < 19
          ? '¡Buenas tardes'
          : '¡Buenas noches';
    const fase = FASES_ISO_9001.find(f => f.id === faseActual);

    if (!fase) {
      return `${saludo}, ${userName}! ¿Listo para comenzar tu camino hacia ISO 9001?`;
    }

    const mensajes = [
      `${saludo}, ${userName}! Estás en la **Fase ${faseActual}: ${fase.nombre}**. ¿En qué te ayudo hoy?`,
      `${saludo}! Veo que trabajas en **${fase.nombre}**. ¿Continuamos donde lo dejamos?`,
      `${saludo}, ${userName}! Hoy podemos avanzar en **${fase.nombreCorto}**. ¿Qué necesitas?`,
    ];

    return mensajes[Math.floor(Math.random() * mensajes.length)];
  }
}
