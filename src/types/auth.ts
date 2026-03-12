// Types for authentication and user management

// Roles del sistema
export type UserRole =
  | 'admin'
  | 'gerente'
  | 'jefe'
  | 'operario'
  | 'auditor'
  | 'super_admin';

export type UserStatus =
  | 'pending_approval'
  | 'active'
  | 'expired'
  | 'suspended';
export type PlanType = 'trial' | 'basic' | 'premium' | 'none';

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  personnel_id: string | null;
  rol: UserRole;
  activo: boolean; // Mantener por retrocompatibilidad, sync con status === 'active'
  status: UserStatus;
  planType: PlanType;
  trialStartDate?: Date;
  expirationDate?: Date;
  isLegacyUser?: boolean;
  organization_id: string | null; // null solo para super_admin
  modulos_habilitados?: string[] | null; // null = acceso completo, [] = sin acceso, ['modulo1'] = acceso específico
  // Mobbex billing fields
  mobbex_subscription_id?: string;
  mobbex_transaction_id?: string;
  billing_status?: 'active' | 'past_due' | 'canceled';
  next_billing_date?: Date;
  last_payment_error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserFormData {
  email: string;
  personnel_id?: string;
  rol: UserRole;
  activo: boolean;
  organization_id?: string;
}

// Mapping from personnel tipo_personal to user rol
export const TIPO_PERSONAL_TO_ROL: Record<string, UserRole> = {
  gerencial: 'gerente',
  supervisor: 'jefe',
  administrativo: 'jefe',
  técnico: 'operario',
  ventas: 'operario',
};
