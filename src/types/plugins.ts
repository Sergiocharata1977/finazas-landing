export type CapabilityStatus =
  | 'installed'
  | 'enabled'
  | 'disabled'
  | 'uninstalled';

export type PlatformCapabilityStatus = 'active' | 'beta' | 'deprecated';
export type CapabilityTier = 'base' | 'opcional' | 'premium';

export interface PluginNavigationEntry {
  name: string;
  href: string;
  icon: string;
  parent?: string;
  feature: string;
  badge?: 'count' | 'alert';
  condition?: 'enabled' | 'role_min_jefe';
  roles?: string[];
}

export interface CapabilityManifest {
  capability_id: string;
  version: string;
  system_id: string;
  navigation: PluginNavigationEntry[];
  settings_schema?: Record<string, unknown>;
  datasets?: string[];
  permissions?: {
    export_roles?: string[];
    restore_roles?: string[];
  };
}

export interface PlatformCapability {
  id: string;
  name: string;
  description: string;
  version: string;
  system_ids: string[];
  scope: 'platform' | 'system';
  status: PlatformCapabilityStatus;
  tier: CapabilityTier;
  icon: string;
  color?: string;
  tags: string[];
  industries?: Array<{
    type: string;
    label: string;
    submodules?: Array<{
      id: string;
      label: string;
      enabled_by_default?: boolean;
    }>;
  }>;
  industry_required?: boolean;
  manifest: CapabilityManifest;
  dependencies?: string[];
  // Campos de marketing y documentación (opcionales para retrocompatibilidad)
  long_description?: string; // Texto de 2-3 párrafos para la ficha del Power
  target_audience?: string; // "Ideal para organizaciones que..."
  features?: string[]; // Lista de funcionalidades ["Doble partida automática", ...]
  benefits?: string[]; // Lista de beneficios ["Reducí el tiempo de cierre", ...]
  how_it_works?: string; // Descripción breve del flujo operativo
  screenshots?: string[]; // URLs en Firebase Storage (futuro)
  created_at?: Date;
  updated_at?: Date;
}

export interface InstalledCapability {
  id: string;
  capability_id: string;
  system_id: string;
  version_installed: string;
  industry_type?: string | null;
  submodules_enabled: string[];
  status: CapabilityStatus;
  enabled: boolean;
  settings: Record<string, unknown>;
  installed_by: string;
  installed_at: Date;
  enabled_at?: Date | null;
  disabled_at?: Date | null;
  updated_at: Date;
}

export interface CapabilityAuditEntry {
  id?: string;
  capability_id: string;
  action:
    | 'installed'
    | 'enabled'
    | 'disabled'
    | 'uninstalled'
    | 'settings_changed'
    | 'upgraded'
    | 'export_requested'
    | 'export_generated'
    | 'backup_created'
    | 'restore_started'
    | 'restore_completed'
    | 'restore_conflict';
  performed_by: string;
  performed_at: Date;
  details?: Record<string, unknown>;
  previous_state?: Record<string, unknown> | null;
}

export interface InstallCapabilityRequest {
  organization_id?: string;
  capability_id: string;
  system_id?: string;
  enabled?: boolean;
  settings?: Record<string, unknown>;
  industry_type?: string | null;
  submodules_enabled?: string[];
}

export interface ToggleCapabilityRequest {
  organization_id?: string;
  capability_id?: string;
  enabled: boolean;
}

export interface UpdateCapabilitySettingsRequest {
  organization_id?: string;
  capability_id?: string;
  settings: Record<string, unknown>;
}

export interface DeleteCapabilityRequest {
  organization_id?: string;
  capability_id?: string;
}

export interface AvailableCapabilitiesRequest {
  organization_id?: string;
  system_id?: string;
}
