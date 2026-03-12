'use client';

import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Compass,
  DollarSign,
  FileText,
  Inbox,
  Layers,
  LifeBuoy,
  MessageSquare,
  Palette,
  Package,
  Plus,
  Server,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  feature?: string;
  children?: MenuItem[];
}

export interface ModuleAccessOption {
  id: string;
  nombre: string;
  descripcion: string;
  selfRegister?: boolean;
}

export const MODULE_ACCESS_OPTIONS: ModuleAccessOption[] = [
  {
    id: 'noticias',
    nombre: 'Noticias',
    descripcion: 'Comunicaciones internas',
    selfRegister: true,
  },
  {
    id: 'calendario',
    nombre: 'Calendario',
    descripcion: 'Agenda y eventos',
    selfRegister: true,
  },
  {
    id: 'dashboard-ejecutivo',
    nombre: 'Ejecutivo',
    descripcion: 'Indicadores ejecutivos',
    selfRegister: true,
  },
  {
    id: 'mi-sgc',
    nombre: 'Mi SGC',
    descripcion: 'Centro de gestion ISO 9001',
    selfRegister: true,
  },
  {
    id: 'planificacion',
    nombre: 'Planificacion y revision',
    descripcion: 'Planificacion estrategica',
    selfRegister: true,
  },
  {
    id: 'mejoras',
    nombre: 'Mejora',
    descripcion: 'Hallazgos y acciones',
    selfRegister: true,
  },
  {
    id: 'documentos',
    nombre: 'Documentos',
    descripcion: 'Control documental',
    selfRegister: true,
  },
  {
    id: 'puntos-norma',
    nombre: 'Puntos de norma',
    descripcion: 'Norma ISO 9001',
    selfRegister: true,
  },
  {
    id: 'crm',
    nombre: 'CRM',
    descripcion: 'Gestion comercial',
    selfRegister: true,
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    descripcion: 'Credito, cartera y cobranzas',
    selfRegister: true,
  },
  {
    id: 'dealer_solicitudes',
    nombre: 'Solicitudes dealer',
    descripcion: 'Backoffice de solicitudes dealer',
    selfRegister: true,
  },
  {
    id: 'rrhh',
    nombre: 'RRHH',
    descripcion: 'Recursos humanos',
    selfRegister: true,
  },
  {
    id: 'procesos',
    nombre: 'Procesos',
    descripcion: 'Mapa y registros de procesos',
    selfRegister: true,
  },
  {
    id: 'admin',
    nombre: 'Administracion',
    descripcion: 'Gestion de usuarios y sistema',
  },
];

// Navegacion principal del sistema - fuente de verdad
export const navigation: MenuItem[] = [
  // ── Items sueltos (arriba) ──
  {
    name: 'Noticias',
    href: '/noticias',
    icon: MessageSquare,
    feature: 'noticias',
  },
  {
    name: 'Calendario',
    href: '/calendario',
    icon: Calendar,
    feature: 'calendario',
  },
  // ── Grupos colapsables ──
  {
    name: 'Direccion',
    href: '/ejecutivo',
    icon: Award,
    children: [
      {
        name: 'Panel ejecutivo',
        href: '/ejecutivo',
        icon: BarChart3,
        feature: 'dashboard-ejecutivo',
      },
      {
        name: 'Planificacion',
        href: '/planificacion-revision-direccion',
        icon: Compass,
        feature: 'planificacion',
      },
      {
        name: 'Indicadores',
        href: '/maturity',
        icon: CheckCircle,
        feature: 'mi-sgc',
      },
      {
        name: 'Revision por la direccion',
        href: '/planificacion-revision-direccion',
        icon: Award,
        feature: 'planificacion',
      },
      {
        name: 'Mapa de Procesos',
        href: '/mapa-procesos',
        icon: Layers,
        feature: 'mi-sgc',
      },
    ],
  },
  {
    name: 'Procesos de Apoyo',
    href: '/rrhh',
    icon: LifeBuoy,
    children: [
      {
        name: 'RRHH',
        href: '/rrhh',
        icon: Users,
        feature: 'rrhh',
      },
      {
        name: 'Documentacion',
        href: '/documentos',
        icon: FileText,
        feature: 'documentos',
      },
      {
        name: 'Compras',
        href: '/procesos',
        icon: Package,
        feature: 'procesos',
      },
      {
        name: 'Infraestructura',
        href: '/iso-infrastructure',
        icon: ShieldCheck,
        feature: 'mi-sgc',
      },
      {
        name: 'Calidad / Hallazgos / Acciones',
        href: '/mejoras',
        icon: Zap,
        feature: 'mejoras',
      },
    ],
  },
  {
    name: 'Procesos Operativos',
    href: '/crm',
    icon: Briefcase,
    children: [
      {
        name: 'CRM / Ventas',
        href: '/crm',
        icon: Briefcase,
        feature: 'crm',
      },
      {
        name: 'Catalogo de Productos',
        href: '/dealer/catalogo',
        icon: Package,
        feature: 'dealer_solicitudes',
      },
      {
        name: 'Solicitudes / Operaciones',
        href: '/solicitudes',
        icon: Inbox,
        feature: 'dealer_solicitudes',
      },
    ],
  },
  {
    name: 'Finanzas',
    href: '/gestion-crediticia',
    icon: DollarSign,
    children: [
      {
        name: 'Gestion crediticia',
        href: '/gestion-crediticia',
        icon: DollarSign,
        feature: 'finanzas',
      },
      {
        name: 'Clientes y cartera',
        href: '/crm/clientes',
        icon: Users,
        feature: 'finanzas',
      },
      {
        name: 'Catalogo comercial',
        href: '/dealer/catalogo',
        icon: Package,
        feature: 'finanzas',
      },
    ],
  },
  {
    name: 'Configuracion',
    href: '/mi-contexto',
    icon: Settings,
    children: [
      {
        name: 'Organizacion',
        href: '/mi-contexto',
        icon: Building2,
      },
      {
        name: 'Capabilities / Plugins',
        href: '/capabilities',
        icon: Layers,
      },
      {
        name: 'Parametros del sistema',
        href: '/configuracion/gobernanza',
        icon: Settings,
        feature: 'mi-sgc',
      },
      {
        name: 'Kanban y estados',
        href: '/crm',
        icon: Calendar,
        feature: 'crm',
      },
      {
        name: 'Mapa de Procesos',
        href: '/configuracion/mapa-procesos',
        icon: Layers,
        feature: 'mi-sgc',
      },
    ],
  },
  // ── Items sueltos (abajo) ──
  {
    name: 'Manual del Sistema',
    href: '/documentacion',
    icon: BookOpen,
  },
  {
    name: 'Usuarios y Roles',
    href: '/admin/usuarios',
    icon: Users,
    feature: 'admin',
  },
];

// Menu especifico para Super Admin
export const superAdminNavigation: MenuItem[] = [
  { name: 'Dashboard Super Admin', href: '/super-admin', icon: BarChart3 },
  { name: 'Sistemas', href: '/super-admin/sistemas', icon: Server },
  {
    name: 'Organizaciones',
    href: '/super-admin/organizaciones',
    icon: Building2,
    children: [
      {
        name: 'Todas las Organizaciones',
        href: '/super-admin/organizaciones',
        icon: Building2,
      },
      {
        name: 'Crear Organizacion',
        href: '/super-admin/organizaciones/nueva',
        icon: Plus,
      },
    ],
  },
  {
    name: 'Solicitudes de Demo',
    href: '/super-admin/demo-requests',
    icon: MessageSquare,
  },
  {
    name: 'Gestion Global',
    href: '/super-admin/gestion',
    icon: Settings,
    children: [
      { name: 'Usuarios Globales', href: '/super-admin/usuarios', icon: Users },
      {
        name: 'Configuracion Sistema',
        href: '/super-admin/configuracion',
        icon: Settings,
      },
      { name: 'Logs y Auditoria', href: '/super-admin/logs', icon: FileText },
    ],
  },
  {
    name: 'Catálogo de Powers',
    href: '/super-admin/capabilities',
    icon: Layers,
  },
  {
    name: 'Design System',
    href: '/super-admin/design-system',
    icon: Palette,
  },
  {
    name: 'Estadisticas',
    href: '/super-admin/stats',
    icon: BarChart3,
    children: [
      {
        name: 'Metricas Globales',
        href: '/super-admin/stats',
        icon: BarChart3,
      },
      {
        name: 'Uso por Organizacion',
        href: '/super-admin/stats/organizaciones',
        icon: Building2,
      },
    ],
  },
];
