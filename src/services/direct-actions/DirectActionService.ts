// Service for handling Direct Actions - AI-triggered database operations

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  DirectActionRequest,
  DirectActionConfirmation,
  DirectActionAuditLog,
  DirectActionResponse,
  DirectActionType,
  DirectActionEntity,
} from '@/types/direct-actions';
import { v4 as uuidv4 } from 'uuid';

export class DirectActionService {
  /**
   * Create a new direct action request
   * Returns a pending confirmation that requires user approval
   */
  static async createActionRequest(
    userId: string,
    sessionId: string,
    request: DirectActionRequest
  ): Promise<DirectActionResponse> {
    const actionId = uuidv4();

    // Validate permissions
    const hasPermission = await this.validatePermissions(userId, request);
    if (!hasPermission) {
      throw new Error(
        `User ${userId} does not have permission for ${request.type} on ${request.entity}`
      );
    }

    // Generate summary
    const summary = this.generateActionSummary(request);

    // Create confirmation record
    const confirmation: DirectActionConfirmation = {
      actionId,
      userId,
      sessionId,
      request,
      summary,
      confirmed: false,
    };

    // Save to Firestore
    await setDoc(doc(db, 'direct_action_confirmations', actionId), {
      ...confirmation,
      createdAt: Timestamp.now(),
    });

    // Log the action
    await this.logAction(userId, actionId, request, summary, 'pending');

    return {
      actionId,
      status: 'pending_confirmation',
      summary,
      message: `⚠️ Acción pendiente de confirmación: ${summary}`,
      requiresConfirmation: request.requiresConfirmation !== false,
      confirmationUrl: `/confirm-action/${actionId}`,
    };
  }

  /**
   * Confirm and execute a direct action
   */
  static async confirmAndExecuteAction(
    actionId: string,
    userId: string,
    confirmed: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    // Get the confirmation record
    const confirmationRef = doc(db, 'direct_action_confirmations', actionId);
    const confirmationSnap = await getDoc(confirmationRef);

    if (!confirmationSnap.exists()) {
      throw new Error(`Action ${actionId} not found`);
    }

    const confirmation = confirmationSnap.data() as DirectActionConfirmation;

    // Verify user is the one who requested it
    if (confirmation.userId !== userId) {
      throw new Error('Unauthorized: User did not request this action');
    }

    if (!confirmed) {
      // Cancel the action
      await updateDoc(confirmationRef, {
        confirmed: false,
        updatedAt: Timestamp.now(),
      });

      await this.logAction(
        userId,
        actionId,
        confirmation.request,
        confirmation.summary,
        'cancelled'
      );

      return {
        success: false,
        message: 'Acción cancelada',
      };
    }

    try {
      // Execute the action
      const result = await this.executeAction(confirmation.request);

      // Update confirmation record
      await updateDoc(confirmationRef, {
        confirmed: true,
        confirmedAt: Timestamp.now(),
        executedAt: Timestamp.now(),
        result: {
          success: true,
          message: result.message,
          data: result.data,
        },
      });

      // Log successful execution
      await this.logAction(
        userId,
        actionId,
        confirmation.request,
        confirmation.summary,
        'executed',
        result
      );

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Update confirmation record with error
      await updateDoc(confirmationRef, {
        confirmed: true,
        confirmedAt: Timestamp.now(),
        error: errorMessage,
      });

      // Log failed execution
      await this.logAction(
        userId,
        actionId,
        confirmation.request,
        confirmation.summary,
        'failed',
        undefined,
        errorMessage
      );

      throw error;
    }
  }

  /**
   * Execute the actual database operation
   */
  private static async executeAction(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    switch (request.type) {
      case 'CREATE':
        return await this.handleCreate(request);
      case 'UPDATE':
        return await this.handleUpdate(request);
      case 'COMPLETE':
        return await this.handleComplete(request);
      case 'ASSIGN':
        return await this.handleAssign(request);
      case 'CHANGE_STATUS':
        return await this.handleChangeStatus(request);
      case 'DELETE':
        return await this.handleDelete(request);
      default:
        throw new Error(`Unknown action type: ${request.type}`);
    }
  }

  private static async handleCreate(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    const collectionName = this.getCollectionName(request.entity);
    const docId = uuidv4();

    await setDoc(doc(db, collectionName, docId), {
      ...request.data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ ${request.entity} creado exitosamente`,
      data: { id: docId },
    };
  }

  private static async handleUpdate(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    if (!request.entityId) {
      throw new Error('entityId is required for UPDATE action');
    }

    const collectionName = this.getCollectionName(request.entity);
    const docRef = doc(db, collectionName, request.entityId);

    await updateDoc(docRef, {
      ...request.data,
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ ${request.entity} actualizado exitosamente`,
      data: { id: request.entityId },
    };
  }

  private static async handleComplete(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    if (!request.entityId) {
      throw new Error('entityId is required for COMPLETE action');
    }

    const collectionName = this.getCollectionName(request.entity);
    const docRef = doc(db, collectionName, request.entityId);

    await updateDoc(docRef, {
      estado: 'completado',
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ ${request.entity} marcado como completado`,
      data: { id: request.entityId },
    };
  }

  private static async handleAssign(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    if (!request.entityId || !request.data.assignedTo) {
      throw new Error('entityId and assignedTo are required for ASSIGN action');
    }

    const collectionName = this.getCollectionName(request.entity);
    const docRef = doc(db, collectionName, request.entityId);

    await updateDoc(docRef, {
      assignedTo: request.data.assignedTo,
      assignedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ ${request.entity} asignado a ${request.data.assignedTo}`,
      data: { id: request.entityId },
    };
  }

  private static async handleChangeStatus(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    if (!request.entityId || !request.data.newStatus) {
      throw new Error(
        'entityId and newStatus are required for CHANGE_STATUS action'
      );
    }

    const collectionName = this.getCollectionName(request.entity);
    const docRef = doc(db, collectionName, request.entityId);

    await updateDoc(docRef, {
      estado: request.data.newStatus,
      statusChangedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ Estado de ${request.entity} cambiado a ${request.data.newStatus}`,
      data: { id: request.entityId },
    };
  }

  private static async handleDelete(
    request: DirectActionRequest
  ): Promise<{ message: string; data?: any }> {
    if (!request.entityId) {
      throw new Error('entityId is required for DELETE action');
    }

    // For safety, we soft-delete by marking as deleted
    const collectionName = this.getCollectionName(request.entity);
    const docRef = doc(db, collectionName, request.entityId);

    await updateDoc(docRef, {
      deleted: true,
      deletedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      message: `✅ ${request.entity} eliminado`,
      data: { id: request.entityId },
    };
  }

  /**
   * Validate user permissions for the action
   */
  private static async validatePermissions(
    userId: string,
    request: DirectActionRequest
  ): Promise<boolean> {
    // Get user document to check role
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();
    const userRole = userData.role || 'user';

    // Admin can do everything
    if (userRole === 'admin') {
      return true;
    }

    // Define role-based permissions
    const rolePermissions: Record<string, DirectActionType[]> = {
      admin: [
        'CREATE',
        'UPDATE',
        'COMPLETE',
        'ASSIGN',
        'CHANGE_STATUS',
        'DELETE',
      ],
      auditor: ['CREATE', 'UPDATE', 'COMPLETE', 'ASSIGN', 'CHANGE_STATUS'],
      manager: ['UPDATE', 'COMPLETE', 'ASSIGN', 'CHANGE_STATUS'],
      user: ['UPDATE', 'COMPLETE'],
    };

    const allowedActions = rolePermissions[userRole] || [];
    return allowedActions.includes(request.type);
  }

  /**
   * Generate human-readable summary of the action
   */
  private static generateActionSummary(request: DirectActionRequest): string {
    const entity = request.entity;
    const type = request.type;

    switch (type) {
      case 'CREATE':
        return `Crear nuevo ${entity}`;
      case 'UPDATE':
        return `Actualizar ${entity} ${request.entityId}`;
      case 'COMPLETE':
        return `Marcar ${entity} ${request.entityId} como completado`;
      case 'ASSIGN':
        return `Asignar ${entity} ${request.entityId} a ${request.data.assignedTo}`;
      case 'CHANGE_STATUS':
        return `Cambiar estado de ${entity} ${request.entityId} a ${request.data.newStatus}`;
      case 'DELETE':
        return `Eliminar ${entity} ${request.entityId}`;
      default:
        return `Ejecutar acción ${type} en ${entity}`;
    }
  }

  /**
   * Get Firestore collection name for entity
   */
  private static getCollectionName(entity: DirectActionEntity): string {
    const collectionMap: Record<DirectActionEntity, string> = {
      audit: 'auditorias',
      finding: 'hallazgos',
      action: 'acciones',
      'non-conformity': 'no_conformidades',
      'process-record': 'registros_procesos',
      personnel: 'personal',
      training: 'capacitaciones',
      evaluation: 'evaluaciones',
    };

    return collectionMap[entity] || entity;
  }

  /**
   * Log action to audit trail
   */
  private static async logAction(
    userId: string,
    actionId: string,
    request: DirectActionRequest,
    summary: string,
    status: 'pending' | 'confirmed' | 'executed' | 'failed' | 'cancelled',
    result?: { message: string; data?: any },
    error?: string
  ): Promise<void> {
    const auditLog: DirectActionAuditLog = {
      id: uuidv4(),
      userId,
      actionId,
      type: request.type,
      entity: request.entity,
      entityId: request.entityId,
      status,
      request,
      summary,
      result: result
        ? {
            success: true,
            message: result.message,
          }
        : undefined,
      error,
      timestamp: new Date(),
    };

    await setDoc(doc(db, 'direct_action_audit_logs', auditLog.id), {
      ...auditLog,
      timestamp: Timestamp.now(),
    });
  }

  /**
   * Get pending confirmations for a user
   */
  static async getPendingConfirmations(
    userId: string
  ): Promise<DirectActionConfirmation[]> {
    const q = query(
      collection(db, 'direct_action_confirmations'),
      where('userId', '==', userId),
      where('confirmed', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as DirectActionConfirmation);
  }

  /**
   * Get audit logs for a user
   */
  static async getAuditLogs(
    userId: string,
    limit: number = 50
  ): Promise<DirectActionAuditLog[]> {
    const q = query(
      collection(db, 'direct_action_audit_logs'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => doc.data() as DirectActionAuditLog)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
