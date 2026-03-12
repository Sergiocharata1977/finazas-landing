'use client';

import { InlineDepartmentSelector } from '@/components/rrhh/InlineDepartmentSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { PositionService } from '@/services/rrhh/PositionService';
import { Position } from '@/types/rrhh';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Edit,
  FileText,
  Trash2,
  Users,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = params.id as string;

  const [position, setPosition] = useState<Position | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPosition = useCallback(async () => {
    try {
      setLoading(true);
      const data = await PositionService.getById(positionId);
      setPosition(data);

      // Load department name if exists
      if (data?.departamento_id) {
        try {
          const dept = await DepartmentService.getById(data.departamento_id);
          if (dept) {
            setDepartmentName(dept.nombre);
          }
        } catch (e) {
          console.error('Error loading department:', e);
        }
      }
    } catch (error) {
      console.error('Error loading position:', error);
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    loadPosition();
  }, [loadPosition]);

  const handleDepartmentSave = async (
    departamentoId: string,
    departamentoName: string
  ) => {
    if (!position) return;

    await PositionService.update(positionId, {
      departamento_id: departamentoId,
    });
    setDepartmentName(departamentoName);
    setPosition(prev =>
      prev ? { ...prev, departamento_id: departamentoId } : null
    );
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este puesto?')) return;

    try {
      setIsDeleting(true);
      await PositionService.delete(positionId);
      router.push('/rrhh/positions');
    } catch (error) {
      console.error('Error deleting position:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Puesto no encontrado
          </h2>
          <Button
            className="mt-4"
            onClick={() => router.push('/rrhh/positions')}
          >
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/rrhh/positions')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-emerald-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {position.nombre}
                </h1>
                <Badge
                  variant={
                    position.is_active !== false ? 'default' : 'secondary'
                  }
                >
                  {position.is_active !== false ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Inline Department Selector */}
              <div className="mt-2">
                <InlineDepartmentSelector
                  positionId={positionId}
                  currentDepartamento={departmentName}
                  currentDepartamentoId={position.departamento_id}
                  onSave={handleDepartmentSave}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() =>
                router.push(`/rrhh/positions/editar/${positionId}`)
              }
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Responsabilidades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Descripción de Responsabilidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {position.descripcion_responsabilidades ||
                    'Sin descripción de responsabilidades'}
                </p>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Requisitos de Experiencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                    {position.requisitos_experiencia || 'No especificados'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Requisitos de Formación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                    {position.requisitos_formacion || 'No especificados'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Personal Asignado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-blue-600">-</p>
                  <p className="text-sm text-gray-500">
                    empleados en este puesto
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Department Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Información Organizacional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    Departamento
                  </p>
                  <p className="font-medium">
                    {departmentName || (
                      <span className="text-amber-600">Sin asignar</span>
                    )}
                  </p>
                </div>
                {position.reporta_a_id && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Reporta a</p>
                    <p className="font-medium">-</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
