'use client';

import Logo from '@/components/ui/Logo';
import { mergeNavigationWithPluginEntries } from '@/lib/plugins/PluginNavigationResolver';
import { isDynamicNavEnabled } from '@/lib/plugins/runtimeFlags';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MenuItem,
  navigation,
  superAdminNavigation,
} from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { PluginNavigationEntry } from '@/types/plugins';
const USE_DYNAMIC_NAV = isDynamicNavEnabled();

export const MobileNav = memo(function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [pluginEntries, setPluginEntries] = useState<
    PluginNavigationEntry[] | null
  >(null);
  const pathname = usePathname();
  const { user } = useAuth();

  const modulosHabilitados = useMemo(() => {
    return (user as any)?.modulos_habilitados || null;
  }, [user]);

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
        if (cancelled) {
          return;
        }

        if (!response.ok || !json.success) {
          setPluginEntries([]);
          return;
        }

        setPluginEntries(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
        if (!cancelled) {
          console.error('[MobileNav] Error loading plugin navigation:', error);
          setPluginEntries([]);
        }
      }
    };

    void loadPluginNavigation();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const resolvedNavigation = useMemo(() => {
    if (!user || user.rol === 'super_admin') return navigation;
    if (!USE_DYNAMIC_NAV) return navigation;
    if (USE_DYNAMIC_NAV && pluginEntries === null) return [];
    return mergeNavigationWithPluginEntries(
      navigation,
      pluginEntries || [],
      user.rol
    );
  }, [pluginEntries, user]);

  const filteredNavigation = useMemo(() => {
    if (USE_DYNAMIC_NAV) return resolvedNavigation;
    if (!user || !modulosHabilitados) return resolvedNavigation;
    return resolvedNavigation.filter(item => {
      if (!item.feature) return true;
      return modulosHabilitados.includes(item.feature);
    });
  }, [user, modulosHabilitados, resolvedNavigation]);

  const toggleMenu = useCallback((menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  }, []);

  const activeMenus = useMemo(() => {
    const active = new Set<string>();
    resolvedNavigation.forEach(item => {
      if (
        pathname === item.href ||
        item.children?.some(
          child =>
            pathname === child.href || pathname.startsWith(child.href + '/')
        )
      ) {
        active.add(item.name);
      }
    });
    return active;
  }, [pathname, resolvedNavigation]);

  useEffect(() => {
    if (activeMenus.size === 0) return;
    setExpandedMenus(prev => {
      const next = new Set(prev);
      activeMenus.forEach(name => next.add(name));
      return next;
    });
  }, [activeMenus]);

  const isMenuActive = useCallback(
    (item: MenuItem): boolean => {
      return activeMenus.has(item.name);
    },
    [activeMenus]
  );

  const handleItemClick = () => {
    setOpen(false);
  };

  const menuItems =
    user?.rol === 'super_admin' ? superAdminNavigation : filteredNavigation;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target">
              <Menu className="h-6 w-6 text-gray-700" />
              <span className="sr-only">Abrir menú</span>
            </button>
          </SheetTrigger>
          <Logo variant="light" size="sm" showText={true} />
        </div>
      </div>

      <SheetContent
        side="left"
        className="w-[85vw] sm:w-[350px] p-0 flex flex-col h-full"
      >
        <SheetHeader className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center">
            <Logo variant="light" size="md" showText={true} />
          </div>
          {user?.rol === 'super_admin' && (
            <div className="mt-4 px-3 py-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider text-center">
                Super Admin
              </p>
            </div>
          )}
        </SheetHeader>

        {/* Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
          {menuItems.map(item => {
            const isActive = isMenuActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.name);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 touch-target ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleItemClick}
                    className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 touch-target ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
                    {item.name}
                  </Link>
                )}

                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map(child => {
                      const isChildActive =
                        pathname === child.href ||
                        pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={handleItemClick}
                          className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 touch-target ${
                            isChildActive
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <child.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Padding inferior para asegurar que se pueda ver el último item */}
        <div className="flex-shrink-0 h-4 bg-white" />
      </SheetContent>
    </Sheet>
  );
});
