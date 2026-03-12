/**
 * RRHHSidebar - Módulo Recursos Humanos
 * Migrado al Design System SidebarShell (light theme)
 */

'use client';

import { ModuleSidebar } from '@/components/design-system/layout/ModuleSidebar';
import { SidebarNavItem } from '@/components/design-system/layout/SidebarShell';
import {
  Award,
  Briefcase,
  Building,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  UserCheck,
  Users,
  Workflow,
} from 'lucide-react';

const menuItems: SidebarNavItem[] = [
  {
    label: 'Departamentos',
    href: '/rrhh/departments',
    icon: Building,
  },
  {
    label: 'Puestos',
    href: '/rrhh/positions',
    icon: Briefcase,
  },
  {
    label: 'Personal',
    href: '/rrhh/personal',
    icon: UserCheck,
  },
  {
    label: 'Capacitaciones',
    href: '/rrhh/capacitaciones',
    icon: GraduationCap,
  },
  {
    label: 'Competencias',
    href: '/rrhh/competencias',
    icon: Award,
  },
  {
    label: 'Evaluaciones',
    href: '/rrhh/evaluaciones',
    icon: FileText,
  },
  {
    label: 'Matriz Polivalencia',
    href: '/rrhh/matriz-polivalencia',
    icon: FileSpreadsheet,
  },
  {
    label: 'Kanban',
    href: '/rrhh/kanban',
    icon: Workflow,
    badge: 'Tareas',
  },
];

export function RRHHSidebar() {
  return (
    <ModuleSidebar
      moduleName="RRHH"
      subtitle="Recursos Humanos"
      moduleIcon={<Users className="w-4 h-4" />}
      items={menuItems}
      accent="purple"
      docModule="rrhh"
      footer={
        <div className="bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 rounded-lg p-3">
          <p className="text-xs text-purple-400 font-medium">
            Gestión de Personal
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Cláusula 7.2 · Competencias
          </p>
        </div>
      }
    />
  );
}
