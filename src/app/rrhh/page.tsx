'use client';

import { ContextHelpButton } from '@/components/docs/ContextHelpButton';

import { PageHeader } from '@/components/design-system';
import { RRHHDashboardCard } from '@/components/rrhh/RRHHDashboardCard';
import { RRHHStats } from '@/components/rrhh/RRHHStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Award,
  Briefcase,
  Building2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  UserCheck,
  Workflow,
} from 'lucide-react';

export default function RRHHDashboardPage() {
  const modules = [
    {
      id: 'departments',
      titulo: 'Departamentos',
      descripcion: 'Gestión de departamentos y áreas organizacionales',
      icon: Building2,
      ruta: '/rrhh/departments',
      color: 'blue',
      habilitado: true,
      estadisticas: { total: 6, activos: 6 },
    },
    {
      id: 'positions',
      titulo: 'Puestos',
      descripcion: 'Definición de puestos y responsabilidades',
      icon: Briefcase,
      ruta: '/rrhh/positions',
      color: 'green',
      habilitado: true,
      estadisticas: { total: 12, activos: 12 },
    },
    {
      id: 'personnel',
      titulo: 'Personal',
      descripcion: 'Gestión completa del personal y empleados',
      icon: UserCheck,
      ruta: '/rrhh/personal',
      color: 'purple',
      habilitado: true,
      estadisticas: { total: 24, activos: 24 },
    },
    {
      id: 'trainings',
      titulo: 'Capacitaciones',
      descripcion: 'Programación y seguimiento de capacitaciones',
      icon: GraduationCap,
      ruta: '/rrhh/capacitaciones',
      color: 'orange',
      habilitado: true,
      estadisticas: { total: 8, en_curso: 3 },
    },
    {
      id: 'competencias',
      titulo: 'Competencias',
      descripcion: 'Definición y gestión de competencias',
      icon: Award,
      ruta: '/rrhh/competencias',
      color: 'yellow',
      habilitado: true,
      estadisticas: { total: 20, asignadas: 15 },
    },
    {
      id: 'evaluations',
      titulo: 'Evaluaciones',
      descripcion: 'Evaluaciones de desempeño y competencias',
      icon: FileText,
      ruta: '/rrhh/evaluaciones',
      color: 'red',
      habilitado: true,
      estadisticas: { total: 15, pendientes: 5 },
    },
    {
      id: 'matriz-polivalencia',
      titulo: 'Matriz Polivalencia',
      descripcion: 'Matriz de habilidades y polivalencia',
      icon: FileSpreadsheet,
      ruta: '/rrhh/matriz-polivalencia',
      color: 'cyan',
      habilitado: true,
      estadisticas: { puestos: 12, personal: 24 },
    },
    {
      id: 'kanban',
      titulo: 'Kanban RRHH',
      descripcion: 'Gestión visual de tareas y procesos',
      icon: Workflow,
      ruta: '/rrhh/kanban',
      color: 'indigo',
      habilitado: true,
      estadisticas: { tareas: 12, completadas: 8 },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          title="Dashboard RRHH"
          description="Gestión integral de Recursos Humanos - Sistema ISO 9001"
          breadcrumbs={[{ label: 'RRHH' }]}
          actions={<ContextHelpButton route="/rrhh" />}
        />

        {/* Estadísticas */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Estadísticas Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <RRHHStats />
          </CardContent>
        </Card>

        {/* Módulos RRHH */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
            Módulos RRHH
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map(module => (
              <RRHHDashboardCard
                key={module.id}
                id={module.id}
                titulo={module.titulo}
                descripcion={module.descripcion}
                icon={module.icon}
                ruta={module.ruta}
                color={module.color}
                habilitado={module.habilitado}
                estadisticas={module.estadisticas}
              />
            ))}
          </div>
        </div>

        {/* Acciones rápidas */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nuevo Departamento</h3>
                    <p className="text-sm text-gray-600">Crear departamento</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nuevo Personal</h3>
                    <p className="text-sm text-gray-600">Registrar empleado</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Nueva Capacitación</h3>
                    <p className="text-sm text-gray-600">Programar curso</p>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
