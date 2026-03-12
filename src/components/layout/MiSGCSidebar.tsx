/**
 * MiSGCSidebar - Módulo Governance & Strategy
 * Migrado al Design System SidebarShell (light theme)
 * (este módulo ya era light, ahora usa el DS)
 */

'use client';

import { ModuleSidebar } from '@/components/design-system/layout/ModuleSidebar';
import { SidebarNavItem } from '@/components/design-system/layout/SidebarShell';
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle,
  Compass,
  LayoutDashboard,
  Users,
} from 'lucide-react';

const menuItems: SidebarNavItem[] = [
  {
    label: 'Madurez',
    href: '/mi-sgc/madurez',
    icon: BarChart3,
    description: 'Diagnóstico organizacional',
  },
  {
    label: 'Cumplimiento',
    href: '/mi-sgc/cumplimiento',
    icon: CheckCircle,
    description: 'Estado por capítulo ISO',
  },
  {
    label: 'Gaps',
    href: '/mi-sgc/gaps',
    icon: AlertTriangle,
    description: 'Análisis de brechas',
  },
  {
    label: 'Roadmap',
    href: '/mi-sgc/roadmap',
    icon: Compass,
    description: 'Camino a certificación',
  },
  {
    label: 'Automatización',
    href: '/mi-sgc/automatizacion',
    icon: Bot,
    description: 'Panel MCP',
  },
  {
    label: 'Resumen Personal',
    href: '/mi-sgc/resumen-usuarios',
    icon: Users,
    description: 'Estado por empleado',
  },
];

export function MiSGCSidebar() {
  return (
    <ModuleSidebar
      moduleName="Mi SGC"
      subtitle="Sistema de Gestión"
      moduleIcon={<LayoutDashboard className="w-4 h-4" />}
      items={menuItems}
      accent="emerald"
      backHref="/noticias"
      docModule="mi-panel"
      footer={
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-3">
          <p className="text-xs text-emerald-400 font-medium">ISO 9001:2015</p>
          <p className="text-xs text-slate-400 mt-1">
            Sistema de Gestión de Calidad
          </p>
        </div>
      }
    />
  );
}
