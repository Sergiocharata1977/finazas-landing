/**
 * Tipos para el módulo WhatsApp Hub
 * Integración con Twilio WhatsApp API + CRM + ISO 9001
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Tipos de conversación
 */
export type ConversationType = 'CRM' | 'ISO9001' | 'INTERNAL';

/**
 * Estado del mensaje
 */
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Dirección del mensaje
 */
export type MessageDirection = 'OUTBOUND' | 'INBOUND';

/**
 * Tipo de mensaje
 */
export type MessageType = 'text' | 'template' | 'media' | 'document';

/**
 * Categoría de plantilla
 */
export type TemplateCategory = 'CRM' | 'ISO9001' | 'INTERNAL' | 'MARKETING';

// ============================================================================
// CONFIGURACIÓN POR ORGANIZACIÓN
// ============================================================================

/**
 * Configuración de WhatsApp por organización (multi-tenant)
 */
export interface WhatsAppConfig {
  enabled: boolean;
  twilio_phone_sid?: string; // SID del número en Twilio
  whatsapp_number?: string; // Número WhatsApp (+54 xxx xxx)
  sandbox_mode: boolean; // true = modo sandbox
  monthly_limit: number; // Límite de mensajes mensuales
  messages_used_this_month: number; // Mensajes usados este mes
  last_reset_date: string; // Fecha último reset del contador
}

// ============================================================================
// CONVERSACIONES
// ============================================================================

/**
 * Conversación de WhatsApp
 */
export interface WhatsAppConversation {
  id: string;
  organization_id: string;
  type: ConversationType;

  // Contacto
  phone: string; // Número WhatsApp del contacto
  contact_name: string; // Nombre del contacto

  // Participantes internos
  participantes: string[]; // userIds involucrados

  // Contexto CRM (opcional)
  cliente_id?: string;
  cliente_nombre?: string;
  oportunidad_id?: string;
  vendedor_id?: string;
  vendedor_nombre?: string;

  // Contexto ISO 9001 (opcional)
  accion_id?: string;
  auditoria_id?: string;
  hallazgo_id?: string;
  documento_id?: string;

  // Estado de la conversación
  ultimo_mensaje: string;
  ultimo_mensaje_at: Date;
  mensajes_no_leidos: number;
  estado: 'activa' | 'archivada' | 'cerrada';

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

/**
 * Datos para crear una conversación
 */
export interface CreateConversationData {
  organization_id: string;
  type: ConversationType;
  phone: string;
  contact_name: string;

  // Contexto opcional
  cliente_id?: string;
  vendedor_id?: string;
  accion_id?: string;
  auditoria_id?: string;
}

// ============================================================================
// MENSAJES
// ============================================================================

/**
 * Mensaje de WhatsApp
 */
export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  organization_id: string;

  // Dirección y participantes
  direction: MessageDirection;
  from: string; // Número origen
  to: string; // Número destino

  // Contenido
  type: MessageType;
  body: string;
  media_url?: string;
  media_type?: string; // image/jpeg, application/pdf, etc.
  template_name?: string;
  template_variables?: string[];

  // Trazabilidad (usuario que envió si es OUTBOUND)
  sender_user_id?: string;
  sender_name?: string;

  // Estado del mensaje
  status: MessageStatus;
  status_updated_at: Date;
  error_code?: string;
  error_message?: string;

  // IDs de Twilio
  twilio_sid?: string;

  // Timestamps
  created_at: Date;
}

/**
 * Datos para enviar un mensaje
 */
export interface SendMessageData {
  organization_id: string;
  conversation_id?: string; // Si ya existe conversación
  to: string; // Número destino
  body: string;

  // Opcional
  type?: MessageType;
  media_url?: string;
  template_name?: string;
  template_variables?: string[];

  // Contexto del remitente
  sender_user_id: string;
  sender_name: string;

  // Contexto CRM/ISO (para crear conversación si no existe)
  cliente_id?: string;
  cliente_nombre?: string;
  vendedor_id?: string;
  accion_id?: string;
  auditoria_id?: string;
}

/**
 * Respuesta de envío de mensaje
 */
export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  twilio_sid?: string;
  conversation_id?: string;
  error?: string;
}

// ============================================================================
// PLANTILLAS
// ============================================================================

/**
 * Plantilla de WhatsApp
 */
export interface WhatsAppTemplate {
  id: string;
  organization_id: string;
  name: string;
  category: TemplateCategory;

  // Contenido
  twilio_template_sid?: string;
  content: string; // Texto con placeholders {{1}}, {{2}}
  variables: string[]; // Nombres de las variables

  // Estado
  aprobada: boolean; // Aprobada por WhatsApp/Twilio
  activa: boolean;

  // Métricas
  uso_count: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// WEBHOOK
// ============================================================================

/**
 * Payload del webhook de Twilio
 */
export interface TwilioWebhookPayload {
  MessageSid: string;
  AccountSid: string;
  From: string;
  To: string;
  Body?: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  SmsStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

/**
 * Payload de status callback de Twilio
 */
export interface TwilioStatusCallback {
  MessageSid: string;
  MessageStatus:
    | 'queued'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed'
    | 'undelivered';
  ErrorCode?: string;
  ErrorMessage?: string;
}

// ============================================================================
// CONTACTOS
// ============================================================================

/**
 * Contacto de WhatsApp
 */
export interface WhatsAppContact {
  id: string;
  organization_id: string;
  phone: string;
  nombre: string;
  tipo: 'cliente' | 'proveedor' | 'interno' | 'otro';

  // Vinculación con entidades
  cliente_id?: string;
  user_id?: string; // Si es usuario interno

  // Preferencias
  opt_in: boolean; // Aceptó recibir mensajes
  opt_in_date?: Date;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ALERTAS AUTOMÁTICAS (ISO 9001)
// ============================================================================

/**
 * Configuración de alertas automáticas
 */
export interface WhatsAppAlertConfig {
  id: string;
  organization_id: string;

  // Tipo de alerta
  tipo:
    | 'accion_vencida'
    | 'auditoria_proxima'
    | 'tarea_asignada'
    | 'no_conformidad_grave'
    | 'documento_pendiente'
    | 'recordatorio_seguimiento';

  // Configuración
  habilitada: boolean;
  template_id?: string;
  dias_anticipacion?: number; // Para auditorías próximas
  destinatarios: 'responsable' | 'supervisor' | 'todos';

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// MÉTRICAS
// ============================================================================

/**
 * Métricas de WhatsApp por organización
 */
export interface WhatsAppMetrics {
  organization_id: string;
  periodo: string; // "2025-12"

  // Mensajes
  mensajes_enviados: number;
  mensajes_recibidos: number;
  mensajes_fallidos: number;

  // Conversaciones
  conversaciones_nuevas: number;
  conversaciones_activas: number;

  // Por módulo
  mensajes_crm: number;
  mensajes_iso9001: number;
  mensajes_interno: number;

  // Tiempos
  tiempo_respuesta_promedio_min?: number;
}
