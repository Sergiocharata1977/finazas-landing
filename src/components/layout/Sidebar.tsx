'use client';

import Logo from '@/components/ui/Logo';
import { mergeNavigationWithPluginEntries } from '@/lib/plugins/PluginNavigationResolver';
import { isDynamicNavEnabled } from '@/lib/plugins/runtimeFlags';
import {
  MenuItem,
  navigation,
  superAdminNavigation,
} from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useEffect, useMemo, useState } from 'react';
import type { PluginNavigationEntry } from '@/types/plugins';

const USE_DYNAMIC_NAV = isDynamicNavEnabled();

const LEGACY_MODULE_ALIASES: Record<string, string[]> = {
  calidad: ['planificacion', 'mejoras', 'puntos-norma', 'mi-sgc'],
  auditorias: ['mejoras'],
  hallazgos: ['mejoras'],
  acciones: ['mejoras'],
  ia_chat: ['mi-sgc'],
};

const SafeIcon = memo(
  ({
    Icon,
    className,
    isMounted,
  }: {
    Icon: React.ComponentType<{ className?: string }>;
    className?: string;
    isMounted: boolean;
  }) => {
    if (!isMounted) {
      return (
        <div
          className={className}
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      );
    }
    return <Icon className={className} />;
  }
);
SafeIcon.displayName = 'SafeIcon';

function filterNavigationByModules(
  items: MenuItem[],
  enabledModules: Set<string> | null
): MenuItem[] {
  return items
    .map(item => {
      const filteredChildren = item.children
        ? filterNavigationByModules(item.children, enabledModules)
        : undefined;

      const hasFeatureAccess =
        !enabledModules || !item.feature || enabledModules.has(item.feature);

      if (
        !hasFeatureAccess &&
        (!filteredChildren || filteredChildren.length === 0)
      ) {
        return null;
      }

      if (item.children) {
        return { ...item, children: filteredChildren };
      }

      return item;
    })
    .filter((item): item is MenuItem => item !== null);
}

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [pluginEntries, setPluginEntries] = useState<
    PluginNavigationEntry[] | null
  >(null);
  const pathname = usePathname();
  const { user, modulosHabilitados } = useAuth();

  const expandedEnabledModules = useMemo(() => {
    if (modulosHabilitados === null) return null;
    const modules = new Set(modulosHabilitados);
    modulosHabilitados.forEach(moduleId => {
      const aliases = LEGACY_MODULE_ALIASES[moduleId] || [];
      aliases.forEach(alias => modules.add(alias));
    });
    return modules;
  }, [modulosHabilitados]);

  useEffect(() => {
    let cancelled = false;
    const loadPluginNavigation = async () => {
      if (!USE_DYNAMIC_NAV || !user || user.rol === 'super_admin') {
        setPluginEntries([]);
        return;
      }
      try {
        const response = await fetch('/api/capabilities/navigation', {
          cache: 'no-store',
        });
        const json = await response.json();
        if (cancelled) return;
        if (!response.ok || !json.success) {
          setPluginEntries([]);
          return;
        }
        setPluginEntries(Array.isArray(json.data) ? json.data : []);
      } catch {
        if (!cancelled) setPluginEntries([]);
      }
    };
    void loadPluginNavigation();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredNavigation = useMemo(() => {
    if (!user || user.rol === 'super_admin') return navigation;
    if (!USE_DYNAMIC_NAV)
      return filterNavigationByModules(navigation, expandedEnabledModules);
    if (USE_DYNAMIC_NAV && pluginEntries === null) return [];
    return mergeNavigationWithPluginEntries(
      navigation,
      pluginEntries || [],
      user.rol
    );
  }, [expandedEnabledModules, pluginEntries, user]);

  const visibleNavigation =
    user?.rol === 'super_admin' ? superAdminNavigation : filteredNavigation;

  // Auto-abrir la sección que contiene la ruta activa
  useEffect(() => {
    if (!isMounted) return;
    const activeSection = visibleNavigation.find(item =>
      item.children?.some(
        child =>
          pathname === child.href || pathname.startsWith(child.href + '/')
      )
    );
    if (activeSection) {
      setOpenSections(prev => {
        if (prev.has(activeSection.name)) return prev;
        return new Set([...prev, activeSection.name]);
      });
    }
  }, [pathname, visibleNavigation, isMounted]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchOrganization = async () => {
      const orgId =
        (user as any)?.organization_id ||
        sessionStorage.getItem('organization_id');
      if (orgId) {
        if (user?.rol !== 'super_admin') {
          setOrganizationName((user as any)?.organization_name || orgId);
          return;
        }
        try {
          const res = await fetch(`/api/super-admin/organizations/${orgId}`);
          if (res.ok) {
            const data = await res.json();
            setOrganizationName(data.organization?.name || orgId);
          } else {
            setOrganizationName(orgId);
          }
        } catch {
          setOrganizationName(orgId);
        }
      }
    };
    if (isMounted && user) fetchOrganization();
  }, [isMounted, user]);

  const isSuperAdmin = user?.rol === 'super_admin';

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionName)) next.delete(sectionName);
      else next.add(sectionName);
      return next;
    });
  };

  return (
    <div
      className={`hidden md:flex flex-shrink-0 flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-slate-800/50 flex-shrink-0">
        <Logo variant="light" size="xs" showText={!collapsed} />
      </div>

      {/* Super Admin badge */}
      {isSuperAdmin && !collapsed && (
        <div className="mx-3 mt-2 px-3 py-1 rounded-lg bg-cyan-900/50">
          <span className="text-cyan-400 font-bold text-[10px] tracking-widest">
            SUPER ADMIN
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {visibleNavigation.map(section => {
          const isOpen = openSections.has(section.name);
          const hasActiveChild = section.children?.some(
            child =>
              pathname === child.href || pathname.startsWith(child.href + '/')
          );
          const isDirectActive = pathname === section.href;
          const isHighlighted = hasActiveChild || isDirectActive;

          /* ── Modo colapsado: solo iconos ── */
          if (collapsed) {
            return (
              <Link
                key={section.name}
                href={section.href}
                title={section.name}
                className={`relative flex items-center justify-center w-full h-11 my-0.5 transition-colors ${
                  isHighlighted
                    ? isSuperAdmin
                      ? 'text-cyan-400'
                      : 'text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SafeIcon
                  Icon={section.icon}
                  className="h-5 w-5"
                  isMounted={isMounted}
                />
                {isHighlighted && (
                  <div
                    className={`absolute left-0 top-2.5 w-0.5 h-6 rounded-r ${
                      isSuperAdmin ? 'bg-cyan-400' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </Link>
            );
          }

          /* ── Modo expandido: sección con accordion ── */
          if (section.children && section.children.length > 0) {
            return (
              <div key={section.name} className="mb-0.5">
                {/* Header de sección — solo colapsa/expande el grupo */}
                <button
                  onClick={() => toggleSection(section.name)}
                  className={`w-full flex items-center justify-between mx-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isHighlighted
                      ? isSuperAdmin
                        ? 'text-cyan-400'
                        : 'text-emerald-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <SafeIcon
                      Icon={section.icon}
                      className="h-4 w-4"
                      isMounted={isMounted}
                    />
                    <span>{section.name}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-3 w-3 flex-shrink-0 opacity-60" />
                  ) : (
                    <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-60" />
                  )}
                </button>

                {/* Items del grupo */}
                {isOpen && (
                  <div className="pb-1">
                    {section.children.map(child => {
                      const isActive =
                        pathname === child.href ||
                        pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center gap-2.5 mx-2 pl-5 pr-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? isSuperAdmin
                                ? 'text-white bg-cyan-900/40 border-l-2 border-cyan-400'
                                : 'text-white bg-emerald-900/30 border-l-2 border-emerald-500'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <SafeIcon
                            Icon={child.icon}
                            className="h-4 w-4 flex-shrink-0"
                            isMounted={isMounted}
                          />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          /* ── Link simple sin hijos ── */
          return (
            <Link
              key={section.name}
              href={section.href}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isDirectActive
                  ? isSuperAdmin
                    ? 'bg-cyan-900/40 text-cyan-300'
                    : 'bg-emerald-900/30 text-emerald-300'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <SafeIcon
                Icon={section.icon}
                className="h-4 w-4 flex-shrink-0"
                isMounted={isMounted}
              />
              <span className="truncate">{section.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Nombre de organización */}
      {!collapsed && organizationName && (
        <div className="px-4 py-1.5 border-t border-slate-800/30">
          <p className="text-[10px] text-slate-500 truncate">{organizationName}</p>
        </div>
      )}

      {/* Botón colapsar sidebar — ÚNICO punto de colapso */}
      <div className="p-3 flex justify-center border-t border-slate-800/50 flex-shrink-0">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
});
