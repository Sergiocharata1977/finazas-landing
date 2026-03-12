'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Building2, LayoutDashboard, Radar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';

export function DashboardHeader() {
  const { usuario } = useCurrentUser();
  const pathname = usePathname();
  const platformName =
    process.env.NEXT_PUBLIC_APP_PLATFORM_NAME || 'Don Candido IA Platform';
  const isMiPanel = pathname?.startsWith('/mi-panel');
  const isRadarEquipo = pathname?.startsWith('/mi-sgc/resumen-usuarios');

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 w-full border-b border-gray-100">
      <div className="w-full h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-default select-none truncate">
            {platformName}
          </h1>
          <Link
            href="/mi-panel"
            className={`hidden md:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm border transition ${
              isMiPanel
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Mi Panel
          </Link>
          <Link
            href="/mi-sgc/resumen-usuarios"
            className={`hidden md:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm border transition ${
              isRadarEquipo
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
            }`}
          >
            <Radar className="w-4 h-4" />
            Radar de Equipo
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-2 py-1 transition-colors cursor-pointer group">
            <div className="p-1.5 bg-emerald-100/50 group-hover:bg-emerald-100 rounded-full transition-colors">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none mb-0.5">
                Organizacion
              </span>
              <span className="text-sm font-medium text-slate-700 leading-none">
                {usuario?.organization_id || 'Sin organizacion'}
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-200/60 hidden md:block"></div>

          <div className="pl-2">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
