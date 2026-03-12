/**
 * AuditLogService - Servicio de logs de auditoría para trazabilidad ISO 9001
 *
 * Este servicio registra todas las acciones críticas del sistema de forma inmutable.
 * Los logs NO pueden ser editados ni eliminados (requerimiento ISO 9001).
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'audit_logs';

// Tipos de acciones que se registran
export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'access_denied'
  | 'permission_change'
  | 'export'
  | 'import';

// Módulos del sistema
export type AuditModule =
  | 'documents'
  | 'audits'
  | 'findings'
  | 'actions'
  | 'personnel'
  | 'trainings'
  | 'evaluations'
  | 'auth'
  | 'billing'
  | 'system';

// Resultado de la acción
export type AuditStatus = 'success' | 'failure' | 'denied';

export interface AuditLogEntry {
  id?: string;
  // Quién realizó la acción
  user_id: string;
  user_email: string;
  user_role: string;
  // Cuándo
  timestamp: Date;
  // Qué hizo
  action: AuditAction;
  module: AuditModule;
  // Sobre qué recurso
  resource_type: string;
  resource_id: string | null;
  resource_name?: string;
  // Contexto multi-tenant
  organization_id: string;
  // Resultado
  status: AuditStatus;
  // Detalles adicionales (cambios, IPs, etc.)
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogService {
  /**
   * Registra una entrada de auditoría
   * Esta función es asíncrona pero no bloquea - usa fire-and-forget
   */
  static async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<string> {
    try {
      const db = getAdminFirestore();

      const logData = {
        ...entry,
        timestamp: Timestamp.now(),
        created_at: Timestamp.now(),
      };

      const docRef = await db.collection(COLLECTION_NAME).add(logData);
      return docRef.id;
    } catch (error) {
      // Los errores de logging no deben afectar la operación principal
      console.error('[AuditLogService] Error logging action:', error);
      return '';
    }
  }

  /**
   * Registra un acceso exitoso a un recurso
   */
  static async logAccess(params: {
    userId: string;
    userEmail: string;
    userRole: string;
    organizationId: string;
    module: AuditModule;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    action: 'create' | 'read' | 'update' | 'delete';
    details?: Record<string, unknown>;
  }): Promise<void> {
    await this.log({
      user_id: params.userId,
      user_email: params.userEmail,
      user_role: params.userRole,
      organization_id: params.organizationId,
      action: params.action,
      module: params.module,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      resource_name: params.resourceName,
      status: 'success',
      details: params.details,
    });
  }

  /**
   * Registra un intento de acceso denegado
   */
  static async logAccessDenied(params: {
    userId: string;
    userEmail: string;
    userRole: string;
    organizationId: string;
    attemptedModule: AuditModule;
    attemptedResource?: string;
    reason: string;
    ipAddress?: string;
  }): Promise<void> {
    await this.log({
      user_id: params.userId,
      user_email: params.userEmail,
      user_role: params.userRole,
      organization_id: params.organizationId,
      action: 'access_denied',
      module: params.attemptedModule,
      resource_type: 'unknown',
      resource_id: params.attemptedResource || null,
      status: 'denied',
      details: { reason: params.reason },
      ip_address: params.ipAddress,
    });
  }

  /**
   * Obtiene logs de auditoría para una organización
   */
  static async getByOrganization(
    organizationId: string,
    options?: {
      limit?: number;
      module?: AuditModule;
      action?: AuditAction;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      const db = getAdminFirestore();
      let query = db
        .collection(COLLECTION_NAME)
        .where('organization_id', '==', organizationId)
        .orderBy('timestamp', 'desc');

      if (options?.module) {
        query = query.where('module', '==', options.module);
      }

      if (options?.action) {
        query = query.where('action', '==', options.action);
      }

      if (options?.startDate) {
        query = query.where(
          'timestamp',
          '>=',
          Timestamp.fromDate(options.startDate)
        );
      }

      if (options?.endDate) {
        query = query.where(
          'timestamp',
          '<=',
          Timestamp.fromDate(options.endDate)
        );
      }

      const limit = options?.limit || 100;
      const snapshot = await query.limit(limit).get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as AuditLogEntry[];
    } catch (error) {
      console.error('[AuditLogService] Error fetching logs:', error);
      return [];
    }
  }

  /**
   * Obtiene logs de un recurso específico
   */
  static async getByResource(
    organizationId: string,
    resourceType: string,
    resourceId: string
  ): Promise<AuditLogEntry[]> {
    try {
      const db = getAdminFirestore();
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .where('organization_id', '==', organizationId)
        .where('resource_type', '==', resourceType)
        .where('resource_id', '==', resourceId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as AuditLogEntry[];
    } catch (error) {
      console.error('[AuditLogService] Error fetching resource logs:', error);
      return [];
    }
  }
}
