'use client';

import { DepartmentForm } from '@/components/rrhh/DepartmentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { Department, DepartmentFormData } from '@/types/rrhh';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  DollarSign,
  Edit,
  FileText,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock stats - in a real app, these would come from the backend
  const stats = [
    {
      title: 'Total Empleados',
      value: '25',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Puestos Activos',
      value: '8',
      change: '+5%',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Presupuesto',
      value: '$500K',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Eficiencia',
      value: '87%',
      change: '+3%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Evaluaciones',
      value: '12',
      change: '+15%',
      changeType: 'positive',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Certificaciones',
      value: '5',
      change: '+2',
      changeType: 'positive',
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const loadDepartment = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DepartmentService.getById(departmentId);
      setDepartment(data);
    } catch (error) {
      console.error('Error loading department:', error);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    loadDepartment();
  }, [loadDepartment]);

  const handleSave = async (formData: DepartmentFormData) => {
    try {
      setIsLoading(true);
      await DepartmentService.update(departmentId, formData);
      await loadDepartment();
      setEditing(false);
    } catch (error) {
      console.error('Error updating department:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este departamento?')) {
      try {
        await DepartmentService.delete(departmentId);
        router.push('/rrhh/departments');
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (editing && department) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Departamento
          </h1>
        </div>

        <DepartmentForm
          initialData={department}
          onSubmit={handleSave}
          isLoading={isLoading}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Departamento no encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            El departamento que buscas no existe o fue eliminado
          </p>
          <Button onClick={() => router.push('/dashboard/rrhh/departments')}>
            Volver a Departamentos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {department.nombre}
            </h1>
            <p className="text-gray-600 mt-1">{department.descripcion}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                            ? 'text-red-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">
                      vs mes anterior
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Main Content - 70% */}
        <div className="lg:col-span-7 space-y-6">
          {/* Información General */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre del Departamento
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {department.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Empleados
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    0 empleados asignados
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <Badge
                    className={
                      department.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {department.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Presupuesto
                  </label>
                  <p className="text-lg font-semibold text-gray-900">N/A</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Descripción
                </label>
                <p className="text-gray-700 mt-1">
                  {department.descripcion || 'Sin descripción disponible'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Asignado */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Personal Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Lista de empleados del departamento
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Funcionalidad en desarrollo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Puestos del Departamento */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Puestos del Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Lista de puestos del departamento
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Funcionalidad en desarrollo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Content - 30% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Documentos Relacionados */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Documentos Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Manual de Procedimientos</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Organigrama</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Políticas del Departamento</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos del Departamento */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                Objetivos del Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-blue-900">
                    Mejorar eficiencia operativa
                  </p>
                  <p className="text-xs text-blue-700">Meta: 15% de mejora</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50">
                  <p className="text-sm font-medium text-emerald-900">
                    Reducir costos operativos
                  </p>
                  <p className="text-xs text-emerald-700">
                    Meta: 10% de reducción
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-purple-900">
                    Aumentar satisfacción del cliente
                  </p>
                  <p className="text-xs text-purple-700">
                    Meta: 90% de satisfacción
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicadores de Calidad */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Indicadores de Calidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Eficiencia</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    87%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cumplimiento</span>
                  <span className="text-sm font-semibold text-blue-600">
                    92%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfacción</span>
                  <span className="text-sm font-semibold text-purple-600">
                    4.2/5
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Cambios */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Historial de Cambios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Departamento actualizado
                    </p>
                    <p className="text-xs text-gray-500">Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Nuevo gerente asignado
                    </p>
                    <p className="text-xs text-gray-500">Hace 1 semana</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Departamento creado</p>
                    <p className="text-xs text-gray-500">Hace 1 mes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
