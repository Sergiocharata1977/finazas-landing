'use client';

import {
  PageHeader,
  PageToolbar,
  Section,
} from '@/components/design-system/layout';
import { DomainCard } from '@/components/design-system/patterns/cards/DomainCard';
import { EntityDetailHeader } from '@/components/design-system/patterns/cards/EntityDetailHeader';
import { KPIStatCard } from '@/components/design-system/patterns/cards/KPIStatCard';
import { UnifiedKanban } from '@/components/design-system/patterns/kanban';
import { KanbanColumnDef } from '@/components/design-system/patterns/kanban/kanbanTypes';
import { ListGrid, ListTable } from '@/components/design-system/patterns/lists';
import { BaseBadge } from '@/components/design-system/primitives/BaseBadge';
import { BaseButton } from '@/components/design-system/primitives/BaseButtonPrimitive';
import { BaseCard } from '@/components/design-system/primitives/BaseCard';
import { InlineTagList } from '@/components/design-system/primitives/InlineTagList';
import { ModuleSidebar } from '@/components/design-system/primitives/ModuleSidebar';
import { ProgressBar } from '@/components/design-system/primitives/ProgressBar';
import { SidebarShell } from '@/components/design-system/primitives/SidebarShell';
import { TabPanel } from '@/components/design-system/primitives/TabPanel';
import {
  moduleAccents,
  radius,
  typography,
} from '@/components/design-system/tokens';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileText,
  Layers,
  MoreHorizontal,
  Palette,
  Plus,
  Printer,
  Receipt,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

// ===========================================================================
// DATOS DE EJEMPLO (dummy) para demostrar los componentes con datos reales
// ===========================================================================
const DEMO_ABM_ITEMS = [
  {
    id: '1',
    title: 'Auditoría Interna ISO 9001',
    code: 'AUD-2026-001',
    description:
      'Auditoría de procesos core del SGC para validación anual de cumplimiento.',
    status: { label: 'Completada', variant: 'success' as const },
    responsible: 'María García',
    date: '2026-01-15',
    type: 'Interna',
  },
  {
    id: '2',
    title: 'Revisión de Procesos Comerciales',
    code: 'AUD-2026-002',
    description:
      'Evaluación del proceso de ventas y atención al cliente post-venta.',
    status: { label: 'En Progreso', variant: 'warning' as const },
    responsible: 'Carlos López',
    date: '2026-02-01',
    type: 'Interna',
  },
  {
    id: '3',
    title: 'Auditoría de Proveedores',
    code: 'AUD-2026-003',
    description:
      'Verificación de cumplimiento de requisitos en proveedores críticos.',
    status: { label: 'Planificada', variant: 'secondary' as const },
    responsible: 'Ana Martínez',
    date: '2026-03-10',
    type: 'Externa',
  },
  {
    id: '4',
    title: 'Control Documental',
    code: 'AUD-2026-004',
    description:
      'Revisión del sistema de gestión documental y control de registros.',
    status: { label: 'Planificada', variant: 'secondary' as const },
    responsible: 'Pedro Sánchez',
    date: '2026-04-20',
    type: 'Interna',
  },
  {
    id: '5',
    title: 'Evaluación de Riesgos AMFE',
    code: 'AUD-2026-005',
    description:
      'Análisis modal de fallos y efectos para procesos productivos.',
    status: { label: 'Completada', variant: 'success' as const },
    responsible: 'Laura Fernández',
    date: '2026-01-28',
    type: 'Interna',
  },
  {
    id: '6',
    title: 'Auditoría RRHH y Competencias',
    code: 'AUD-2026-006',
    description:
      'Verificación del plan de capacitación y evaluación de competencias del personal.',
    status: { label: 'En Progreso', variant: 'warning' as const },
    responsible: 'Roberto Díaz',
    date: '2026-02-15',
    type: 'Interna',
  },
];

const DEMO_KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'planificada', title: 'Planificada', color: 'bg-slate-500' },
  { id: 'en_progreso', title: 'En Progreso', color: 'bg-blue-500' },
  { id: 'completada', title: 'Completada', color: 'bg-green-500' },
];

const DEMO_KANBAN_ITEMS: any[] = [
  {
    id: 'k1',
    title: 'Revisar documentación SGC',
    status: 'planificada',
    priority: 'high',
    assignee: { name: 'María' },
  },
  {
    id: 'k2',
    title: 'Inspección planta norte',
    status: 'planificada',
    priority: 'medium',
  },
  {
    id: 'k3',
    title: 'Actualizar política calidad',
    status: 'en_progreso',
    priority: 'high',
    assignee: { name: 'Carlos' },
  },
  {
    id: 'k4',
    title: 'Entrevistas al personal',
    status: 'en_progreso',
    priority: 'medium',
  },
  {
    id: 'k5',
    title: 'Auditoría interna Q1',
    status: 'completada',
    priority: 'high',
    assignee: { name: 'Admin' },
  },
  {
    id: 'k6',
    title: 'Verificación proveedores',
    status: 'completada',
    priority: 'low',
  },
];

// ===========================================================================
// COMPONENTE PRINCIPAL
// ===========================================================================
export default function DesignSystemPage() {
  const [abmViewMode, setAbmViewMode] = useState<'grid' | 'list' | 'kanban'>(
    'grid'
  );
  const [abmSearch, setAbmSearch] = useState('');
  const [abmStatusFilter, setAbmStatusFilter] = useState('all');
  const [entityTab, setEntityTab] = useState('resumen');
  const [tabVariant, setTabVariant] = useState<'underline' | 'pills'>(
    'underline'
  );

  const [componentViewMode, setComponentViewMode] = useState<'grid' | 'list'>(
    'grid'
  );

  // Filtrado del ABM demo
  const filteredItems = DEMO_ABM_ITEMS.filter(item => {
    const matchesSearch =
      !abmSearch ||
      item.title.toLowerCase().includes(abmSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(abmSearch.toLowerCase());
    const matchesStatus =
      abmStatusFilter === 'all' ||
      item.status.label.toLowerCase().replace(' ', '_') === abmStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats calculados
  const stats = {
    total: DEMO_ABM_ITEMS.length,
    completadas: DEMO_ABM_ITEMS.filter(i => i.status.variant === 'success')
      .length,
    enProgreso: DEMO_ABM_ITEMS.filter(i => i.status.variant === 'warning')
      .length,
    planificadas: DEMO_ABM_ITEMS.filter(i => i.status.variant === 'secondary')
      .length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ============================================================= */}
        {/* INTRO HEADER */}
        {/* ============================================================= */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Palette className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Design System</h1>
              <p className="text-emerald-100 text-lg">
                Muestrario de componentes y patrón ABM estándar
              </p>
            </div>
          </div>
          <p className="text-emerald-100 max-w-3xl">
            Este catálogo muestra los componentes del Design System en uso real.
            Todos los cambios en los componentes se reflejan automáticamente
            aquí. Cada página ABM nueva debe seguir el patrón mostrado abajo.
          </p>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              'Nuevos P0',
              'Patrón ABM Completo',
              'Tokens',
              'Primitivas',
              'Layout',
              'Patrones',
              'Kanban',
              'Sidebars',
            ].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <section id="sidebars" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Sidebars (Plataforma + Modulo)
          </h2>
          <p className="text-slate-600">
            Referencia canonica para barra lateral principal y barra lateral por
            submodulo.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SidebarShell
              title="Super Admin"
              scope="platform"
              activeHref="/super-admin/demo-requests"
              items={[
                { label: 'Dashboard', href: '/super-admin', icon: TrendingUp },
                {
                  label: 'Organizaciones',
                  icon: Users,
                  children: [
                    { label: 'Todas', href: '/super-admin/organizaciones' },
                    {
                      label: 'Nueva',
                      href: '/super-admin/organizaciones/nueva',
                    },
                  ],
                },
                {
                  label: 'Solicitudes Demo',
                  href: '/super-admin/demo-requests',
                  icon: FileText,
                  badge: 3,
                },
              ]}
            />
            <ModuleSidebar
              moduleName="Finanzas"
              activeHref="/finanzas/cuentas-corrientes"
              items={[
                {
                  label: 'Cuentas corrientes',
                  href: '/finanzas/cuentas-corrientes',
                  icon: Receipt,
                },
                {
                  label: 'Plan de cuentas',
                  href: '/finanzas/plan-cuentas',
                  icon: Layers,
                },
                {
                  label: 'Libros',
                  icon: FileText,
                  children: [
                    { label: 'Libro diario', href: '/finanzas/libros/diario' },
                    { label: 'Mayor', href: '/finanzas/libros/mayor' },
                  ],
                },
              ]}
            />
          </div>
        </section>

        {/* ============================================================= */}
        {/* 🌟 PATRÓN ABM COMPLETO - Ejemplo Interactivo VIVO */}
        {/* ============================================================= */}
        <section id="patrón-abm-completo" className="space-y-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Layers className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Patrón ABM Completo
              </h2>
              <p className="text-slate-500">
                Este es el diseño que TODA página ABM debe seguir. Los
                componentes son los reales del Design System.
              </p>
            </div>
          </div>

          {/* Box visual que simula una página ABM completa */}
          <div className="border-2 border-emerald-200 rounded-xl overflow-hidden bg-white shadow-lg">
            {/* Label */}
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                📐 PÁGINA ABM EJEMPLO — Todas las páginas deben verse así
              </span>
              <span className="text-xs text-emerald-500">
                Componentes vivos del Design System
              </span>
            </div>

            {/* Contenido ABM simulado */}
            <div className="p-6 space-y-6 bg-slate-50">
              {/* 1. PageHeader */}
              <div className="relative">
                <div className="absolute -left-2 top-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-10">
                  1. PageHeader
                </div>
                <PageHeader
                  title="Auditorías"
                  description="Gestión de auditorías internas ISO 9001"
                  breadcrumbs={[
                    { label: 'Mejora', href: '#' },
                    { label: 'Auditorías' },
                  ]}
                  actions={
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Opciones
                      </Button>
                      <Button className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Auditoría
                      </Button>
                    </div>
                  }
                />
              </div>

              {/* 2. Stats Row */}
              <div className="relative">
                <div className="absolute -left-2 top-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-10">
                  2. Stats
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total"
                    value={stats.total}
                    icon={<FileText className="w-5 h-5" />}
                    color="slate"
                  />
                  <StatCard
                    label="Completadas"
                    value={stats.completadas}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    color="green"
                  />
                  <StatCard
                    label="En Progreso"
                    value={stats.enProgreso}
                    icon={<Clock className="w-5 h-5" />}
                    color="amber"
                  />
                  <StatCard
                    label="Planificadas"
                    value={stats.planificadas}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="blue"
                  />
                </div>
              </div>

              {/* 3. PageToolbar */}
              <div className="relative">
                <div className="absolute -left-2 top-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-10">
                  3. PageToolbar
                </div>
                <PageToolbar
                  searchValue={abmSearch}
                  onSearch={setAbmSearch}
                  viewMode={abmViewMode}
                  onViewModeChange={mode => setAbmViewMode(mode as any)}
                  supportedViews={['grid', 'list', 'kanban']}
                  searchPlaceholder="Buscar auditoría..."
                  filterOptions={
                    <div className="flex gap-2">
                      <Select
                        value={abmStatusFilter}
                        onValueChange={setAbmStatusFilter}
                      >
                        <SelectTrigger className="w-[180px] h-10 bg-background border-input">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="completada">Completada</SelectItem>
                          <SelectItem value="en_progreso">
                            En Progreso
                          </SelectItem>
                          <SelectItem value="planificada">
                            Planificada
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  }
                />
              </div>

              {/* 4. Content Area */}
              <div className="relative">
                <div className="absolute -left-2 top-0 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-r-md z-10">
                  4. Content (
                  {abmViewMode === 'grid'
                    ? 'ListGrid + DomainCard'
                    : abmViewMode === 'list'
                      ? 'ListTable'
                      : 'UnifiedKanban'}
                  )
                </div>
                <div className="pt-4">
                  {abmViewMode === 'grid' && (
                    <ListGrid
                      data={filteredItems}
                      renderItem={item => (
                        <DomainCard
                          title={item.title}
                          subtitle={item.code}
                          status={item.status}
                          meta={
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {item.responsible}
                              </span>
                              <span>{item.date}</span>
                            </div>
                          }
                          actions={[
                            {
                              label: 'Ver',
                              onClick: () => {},
                              icon: <Eye className="w-4 h-4" />,
                              variant: 'outline',
                            },
                            {
                              label: 'Editar',
                              onClick: () => {},
                              icon: <Settings className="w-4 h-4" />,
                            },
                          ]}
                        >
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </DomainCard>
                      )}
                      keyExtractor={item => item.id}
                    />
                  )}
                  {abmViewMode === 'list' && (
                    <ListTable
                      data={filteredItems}
                      columns={[
                        { header: 'Código', accessorKey: 'code' },
                        { header: 'Título', accessorKey: 'title' },
                        { header: 'Responsable', accessorKey: 'responsible' },
                        { header: 'Tipo', accessorKey: 'type' },
                        { header: 'Fecha', accessorKey: 'date' },
                        {
                          header: 'Estado',
                          cell: item => (
                            <BaseBadge variant={item.status.variant}>
                              {item.status.label}
                            </BaseBadge>
                          ),
                        },
                      ]}
                      keyExtractor={item => item.id}
                    />
                  )}
                  {abmViewMode === 'kanban' && (
                    <div className="h-[400px]">
                      <UnifiedKanban
                        columns={DEMO_KANBAN_COLUMNS}
                        items={DEMO_KANBAN_ITEMS}
                        onItemMove={() => {}}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estructura explicada */}
          <div className="bg-slate-800 text-slate-200 rounded-xl p-6 mt-4">
            <h3 className="text-lg font-bold text-white mb-3">
              📋 Estructura Estándar (Copiar en cada ABM)
            </h3>
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
              {`import { PageHeader, PageToolbar } from '@/components/design-system';

<div className="min-h-screen bg-slate-50 dark:bg-slate-900">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    
    {/* 1. PageHeader — título, breadcrumbs, botón "Nuevo" */}
    <PageHeader
      title="[Entidad]"
      description="Gestión de [entidades]"
      breadcrumbs={[{ label: 'Módulo', href: '/modulo' }, { label: 'Entidad' }]}
      actions={<Button>+ Nueva Entidad</Button>}
    />

    {/* 2. Stats — tarjetas con contadores */}
    <StatsRow />

    {/* 3. PageToolbar — búsqueda, filtros, cambio de vista */}
    <PageToolbar
      searchValue={search} onSearch={setSearch}
      viewMode={viewMode} onViewModeChange={setViewMode}
      supportedViews={['grid', 'list', 'kanban']}
      filterOptions={<Select>...</Select>}
    />

    {/* 4. Content — usa ListGrid/ListTable/UnifiedKanban */}
    {viewMode === 'grid' && <ListGrid data={items} renderItem={...} />}
    {viewMode === 'list' && <ListTable data={items} columns={...} />}
    {viewMode === 'kanban' && <UnifiedKanban columns={...} items={...} />}
    
  </div>
</div>`}
            </pre>
          </div>
        </section>

        {/* ============================================================= */}
        {/* TOKENS */}
        {/* ============================================================= */}
        <section id="tokens" className="space-y-6">
          <SectionTitle
            title="Tokens"
            description="Variables de diseño base: tipografía, colores, radios"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Typography */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📝 Tipografía
              </h3>
              <div className="space-y-3">
                <div className={typography.h1}>Heading 1 (h1)</div>
                <div className={typography.h2}>Heading 2 (h2)</div>
                <div className={typography.h3}>Heading 3 (h3)</div>
                <div className={typography.p}>
                  Paragraph (p): The quick brown fox jumps over the lazy dog.
                </div>
                <div className={typography.small}>Small text (small)</div>
                <div className="pt-3 border-t space-y-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase">
                    Nuevos
                  </span>
                  <div className={typography.display}>
                    U$D 2.400.000{' '}
                    <span className="text-sm text-muted-foreground">
                      (display)
                    </span>
                  </div>
                  <div className={typography.stat}>
                    1/12{' '}
                    <span className="text-sm text-muted-foreground">
                      (stat)
                    </span>
                  </div>
                  <div className={typography.label}>
                    VALOR CERRADO DEL BOLETO (label)
                  </div>
                  <div className={typography.kpiValue}>
                    Unidad 102{' '}
                    <span className="text-sm text-muted-foreground">
                      (kpiValue)
                    </span>
                  </div>
                  <div className={typography.kpiLabel}>PROYECTO (kpiLabel)</div>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🎨 Colores Semánticos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ColorSwatch
                  name="Primary"
                  className="bg-primary text-primary-foreground"
                />
                <ColorSwatch
                  name="Secondary"
                  className="bg-secondary text-secondary-foreground"
                />
                <ColorSwatch
                  name="Destructive"
                  className="bg-destructive text-destructive-foreground"
                />
                <ColorSwatch
                  name="Muted"
                  className="bg-muted text-muted-foreground"
                />
                <ColorSwatch
                  name="Accent"
                  className="bg-accent text-accent-foreground"
                />
                <ColorSwatch
                  name="Card"
                  className="bg-card text-card-foreground border"
                />
              </div>
              <h3 className="text-lg font-semibold flex items-center gap-2 pt-4 border-t">
                🏷️ Acentos por Módulo{' '}
                <span className="text-xs font-normal text-emerald-600">
                  Nuevo
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(moduleAccents).map(([name, accentObj]) => (
                  <div key={name} className="flex flex-col gap-1">
                    <div
                      className={`h-14 w-full rounded-lg shadow-sm flex items-center justify-center text-xs font-medium text-white ${accentObj.accent}`}
                    >
                      {name}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground text-center">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">📐 Border Radius</h3>
            <div className="flex flex-wrap gap-6">
              {[
                { name: 'sm', token: radius.sm },
                { name: 'md', token: radius.md },
                { name: 'lg', token: radius.lg },
                { name: 'full', token: radius.full },
              ].map(r => (
                <div key={r.name} className="text-center">
                  <div
                    className={`w-16 h-16 bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-sm font-mono font-medium ${r.token}`}
                  >
                    {r.name}
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* PRIMITIVAS */}
        {/* ============================================================= */}
        <section id="primitivas" className="space-y-6">
          <SectionTitle
            title="Primitivas"
            description="Componentes atómicos reutilizables"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">🔘 BaseButton</h3>
              <div className="flex flex-wrap gap-3">
                <BaseButton variant="default">Default</BaseButton>
                <BaseButton variant="secondary">Secondary</BaseButton>
                <BaseButton variant="outline">Outline</BaseButton>
                <BaseButton variant="ghost">Ghost</BaseButton>
                <BaseButton variant="destructive">Destructive</BaseButton>
                <BaseButton variant="link">Link</BaseButton>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t">
                <BaseButton size="sm">Small</BaseButton>
                <BaseButton>Default</BaseButton>
                <BaseButton size="lg">Large</BaseButton>
                <BaseButton>
                  <Plus className="mr-2 h-4 w-4" /> Con Icono
                </BaseButton>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold">🏷️ BaseBadge</h3>
              <div className="flex flex-wrap gap-3">
                <BaseBadge variant="default">Default</BaseBadge>
                <BaseBadge variant="secondary">Secondary</BaseBadge>
                <BaseBadge variant="outline">Outline</BaseBadge>
                <BaseBadge variant="destructive">Destructive</BaseBadge>
                <BaseBadge variant="success">Success</BaseBadge>
                <BaseBadge variant="warning">Warning</BaseBadge>
              </div>
              <h3 className="text-lg font-semibold pt-4">📦 BaseCard</h3>
              <div className="grid grid-cols-3 gap-3">
                <BaseCard padding="sm">
                  <div className="font-medium text-sm">SM</div>
                  <div className="text-xs text-muted-foreground">Compacto</div>
                </BaseCard>
                <BaseCard padding="md">
                  <div className="font-medium text-sm">MD</div>
                  <div className="text-xs text-muted-foreground">Estándar</div>
                </BaseCard>
                <BaseCard padding="lg">
                  <div className="font-medium text-sm">LG</div>
                  <div className="text-xs text-muted-foreground">Espacioso</div>
                </BaseCard>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* LAYOUT */}
        {/* ============================================================= */}
        <section id="layout" className="space-y-6">
          <SectionTitle
            title="Layout"
            description="Componentes de estructura de página"
          />

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b px-4 py-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                PageHeader + Section + PageToolbar
              </span>
            </div>
            <div className="p-6">
              <PageHeader
                title="Título de Página"
                subtitle="Descripción breve del módulo y su propósito."
              >
                <Button size="sm">Acción Principal</Button>
              </PageHeader>
              <Section>
                <PageToolbar viewMode="grid" onViewModeChange={() => {}} />
                <div className="h-24 bg-muted/20 border border-dashed rounded-lg flex items-center justify-center mt-4 text-slate-400">
                  Área de Contenido
                </div>
              </Section>
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* PATRONES */}
        {/* ============================================================= */}
        <section id="patrones" className="space-y-6">
          <SectionTitle
            title="Patrones de Dominio"
            description="DomainCard + ListGrid + ListTable"
          />

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">
                DomainCard en diferentes vistas
              </span>
              <div className="flex gap-2">
                <Button
                  variant={componentViewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComponentViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={componentViewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComponentViewMode('list')}
                >
                  Table
                </Button>
              </div>
            </div>
            <div className="p-6">
              {componentViewMode === 'grid' ? (
                <ListGrid
                  data={DEMO_ABM_ITEMS.slice(0, 3)}
                  renderItem={item => (
                    <DomainCard
                      title={item.title}
                      subtitle={item.code}
                      status={item.status}
                      meta={
                        <div className="text-xs text-muted-foreground">
                          Responsable:{' '}
                          <span className="font-medium text-foreground">
                            {item.responsible}
                          </span>
                        </div>
                      }
                      actions={[
                        {
                          label: 'Editar',
                          onClick: () => {},
                          icon: <Settings className="w-4 h-4" />,
                        },
                        { label: 'Ver', onClick: () => {}, variant: 'default' },
                      ]}
                    >
                      <div className="text-sm mt-2 line-clamp-2">
                        {item.description}
                      </div>
                    </DomainCard>
                  )}
                  keyExtractor={item => item.id}
                />
              ) : (
                <ListTable
                  data={DEMO_ABM_ITEMS.slice(0, 3)}
                  columns={[
                    { header: 'Código', accessorKey: 'code' },
                    { header: 'Nombre', accessorKey: 'title' },
                    { header: 'Responsable', accessorKey: 'responsible' },
                    {
                      header: 'Estado',
                      cell: item => (
                        <BaseBadge variant={item.status.variant}>
                          {item.status.label}
                        </BaseBadge>
                      ),
                    },
                  ]}
                  keyExtractor={item => item.id}
                />
              )}
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* KANBAN */}
        {/* ============================================================= */}
        <section id="kanban" className="space-y-6">
          <SectionTitle
            title="Unified Kanban"
            description="Vista Kanban drag-and-drop para gestión de flujos"
          />

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b px-4 py-2">
              <span className="text-xs font-bold text-slate-500 uppercase">
                UnifiedKanban
              </span>
            </div>
            <div className="h-[400px] p-4">
              <UnifiedKanban
                columns={DEMO_KANBAN_COLUMNS}
                items={DEMO_KANBAN_ITEMS}
                onItemMove={() => {}}
              />
            </div>
          </div>
        </section>

        {/* ============================================================= */}
        {/* 🌟 NUEVOS COMPONENTES P0 */}
        {/* ============================================================= */}
        <section id="nuevos-p0" className="space-y-6">
          <SectionTitle
            title="🌟 Nuevos Componentes P0"
            description="EntityDetailHeader, KPIStatCard, ProgressBar, TabPanel, InlineTagList"
          />

          {/* EntityDetailHeader */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              👤 EntityDetailHeader
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </h3>
            <EntityDetailHeader
              name="Lucas Perez"
              subtitle="lucas.perez@gmail.com"
              tags={[
                { label: 'Consumidor final', color: 'blue' },
                { label: 'Activa', color: 'green' },
                { label: 'Canje', color: 'amber' },
              ]}
              stats={[
                { label: 'PROYECTO', value: 'ElloyVillage' },
                { label: 'UNIDADES', value: 'Unidad 102' },
                { label: 'VALOR TOTAL', value: 'U$D 2.400.000' },
              ]}
              actions={[
                {
                  icon: <Printer className="w-4 h-4" />,
                  label: 'Imprimir',
                  onClick: () => {},
                },
                {
                  icon: <Copy className="w-4 h-4" />,
                  label: 'Copiar',
                  onClick: () => {},
                },
                {
                  icon: <MoreHorizontal className="w-4 h-4" />,
                  label: 'Más',
                  onClick: () => {},
                },
              ]}
              tabs={[
                {
                  id: 'resumen',
                  label: 'Resumen',
                  icon: <FileText className="w-4 h-4" />,
                },
                { id: 'cobranzas', label: 'Cobranzas', badge: 3 },
                {
                  id: 'facturas',
                  label: 'Facturas',
                  icon: <Receipt className="w-4 h-4" />,
                },
                { id: 'actividad', label: 'Actividad' },
              ]}
              activeTab={entityTab}
              onTabChange={setEntityTab}
            />
            <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center text-sm text-muted-foreground">
              Contenido del tab &ldquo;<strong>{entityTab}</strong>&rdquo; se
              muestra aquí
            </div>
          </div>

          {/* KPIStatCard */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📊 KPIStatCard
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPIStatCard
                label="VALOR CERRADO DEL BOLETO"
                value="U$D 2.400.000"
                progress={{
                  value: 58,
                  label: 'ABONADO U$D 1.380.000',
                  color: 'info',
                }}
                subtext="12 DE NOV 2024"
              />
              <KPIStatCard
                label="CUOTAS ABONADAS"
                value="1/12"
                progress={{
                  value: 8,
                  label: 'Progreso de cuotas',
                  color: 'success',
                }}
                subtext="Próximo vencimiento: 12/12/2025"
              />
              <KPIStatCard
                label="RENDIMIENTO MENSUAL"
                value="+12.5%"
                trend={{ value: '+2.3%', direction: 'up' }}
                icon={<TrendingUp className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* ProgressBar */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📏 ProgressBar
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </h3>
            <BaseCard>
              <div className="space-y-4">
                <ProgressBar
                  value={75}
                  color="primary"
                  label="Primary"
                  showPercentage
                />
                <ProgressBar
                  value={58}
                  color="info"
                  label="Info"
                  showPercentage
                />
                <ProgressBar
                  value={45}
                  color="success"
                  label="Success"
                  showPercentage
                />
                <ProgressBar
                  value={30}
                  color="warning"
                  label="Warning"
                  showPercentage
                />
                <ProgressBar
                  value={15}
                  color="destructive"
                  label="Destructive"
                  showPercentage
                />
                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Tamaños:
                  </p>
                  <div className="space-y-3">
                    <ProgressBar
                      value={60}
                      size="sm"
                      label="Small"
                      showPercentage
                    />
                    <ProgressBar
                      value={60}
                      size="md"
                      label="Medium"
                      showPercentage
                    />
                    <ProgressBar
                      value={60}
                      size="lg"
                      label="Large"
                      showPercentage
                    />
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          {/* TabPanel */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📑 TabPanel
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </h3>
            <BaseCard>
              <div className="space-y-6">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={tabVariant === 'underline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTabVariant('underline')}
                  >
                    Underline
                  </Button>
                  <Button
                    variant={tabVariant === 'pills' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTabVariant('pills')}
                  >
                    Pills
                  </Button>
                </div>
                <TabPanel
                  variant={tabVariant}
                  tabs={[
                    {
                      id: 'general',
                      label: 'General',
                      icon: <Settings className="w-4 h-4" />,
                    },
                    { id: 'permisos', label: 'Permisos', badge: 5 },
                    { id: 'historial', label: 'Historial' },
                    { id: 'config', label: 'Configuración' },
                  ]}
                  activeTab={entityTab}
                  onChange={setEntityTab}
                />
              </div>
            </BaseCard>
          </div>

          {/* InlineTagList */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🏷️ InlineTagList
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Nuevo
              </span>
            </h3>
            <BaseCard>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Tags coloreados:
                  </p>
                  <InlineTagList
                    tags={[
                      { label: 'Consumidor final', color: 'blue' },
                      { label: 'Activa', color: 'green' },
                      { label: 'Canje', color: 'amber' },
                      { label: 'VIP', color: 'purple' },
                      { label: 'Urgente', color: 'red' },
                    ]}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Con overflow (max 3):
                  </p>
                  <InlineTagList
                    tags={[
                      { label: 'ISO 9001', color: 'blue' },
                      { label: 'Agro', color: 'green' },
                      { label: 'Finanzas', color: 'amber' },
                      { label: 'Industria', color: 'purple' },
                      { label: 'Premium', color: 'indigo' },
                    ]}
                    maxVisible={3}
                  />
                </div>
              </div>
            </BaseCard>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-sm text-slate-400">
          Design System • Don Cándido IA • Última actualización: automática al
          cambiar componentes
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// COMPONENTES AUXILIARES
// ===========================================================================

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b pb-3">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`h-14 w-full rounded-lg shadow-sm flex items-center justify-center text-xs font-medium ${className}`}
      >
        Aa
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center">
        {name}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    slate: 'text-slate-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <div
        className={`p-2 rounded-lg bg-slate-100 ${colorMap[color] || 'text-slate-600'}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p
          className={`text-2xl font-bold ${colorMap[color] || 'text-slate-900'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
