'use client';

import { ProcessDefinitionForm } from '@/components/procesos/ProcessDefinition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ProcessDefinitionFormData } from '@/lib/validations/procesos';
import { ProcessService } from '@/services/procesos/ProcessService';
import { ProcessDefinition } from '@/types/procesos';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProcessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const processId = params.id as string;

  const [process, setProcess] = useState<ProcessDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    entradas: false,
    salidas: false,
    controles: false,
    indicadores: false,
    documentos: false,
  });

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const data = await ProcessService.getById(processId);
        setProcess(data);
      } catch (error) {
        console.error('Error al cargar proceso:', error);
      } finally {
        setLoading(false);
      }
    };

    if (processId) {
      fetchProcess();
    }
  }, [processId]);

  const handleFormSubmit = async (data: ProcessDefinitionFormData) => {
    setIsLoading(true);
    try {
      // Transform array fields from objects to strings
      const transformedData: Partial<
        Omit<ProcessDefinition, 'id' | 'createdAt'>
      > = {
        ...data,
        entradas: data.entradas.map(e => (typeof e === 'string' ? e : e.value)),
        salidas: data.salidas.map(s => (typeof s === 'string' ? s : s.value)),
        controles: data.controles.map(c =>
          typeof c === 'string' ? c : c.value
        ),
        indicadores: data.indicadores.map(i =>
          typeof i === 'string' ? i : i.value
        ),
        documentos: data.documentos.map(d =>
          typeof d === 'string' ? d : d.value
        ),
      };

      await ProcessService.update(processId, transformedData);
      const updatedProcess = await ProcessService.getById(processId);
      setProcess(updatedProcess);
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar proceso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setEditing(false);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderArrayField = (
    title: string,
    items: string[] | undefined,
    section: string
  ) => {
    const safeItems = items || [];

    return (
      <Collapsible
        open={openSections[section]}
        onOpenChange={() => toggleSection(section)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto hover:bg-emerald-50/50 transition-colors duration-200"
          >
            <span className="font-medium text-gray-800">
              {title} ({safeItems.length})
            </span>
            {openSections[section] ? (
              <ChevronDown className="h-4 w-4 text-emerald-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-emerald-600" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-2">
            {safeItems.length > 0 ? (
              safeItems.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-emerald-50/30 to-white rounded-lg shadow-sm border border-emerald-100/30 hover:shadow-md transition-all duration-200"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic p-3 bg-gray-50/50 rounded-lg">
                No hay elementos definidos
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Proceso no encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            El proceso que buscas no existe o ha sido eliminado.
          </p>
          <Button
            onClick={() => router.push('/procesos/definiciones')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setEditing(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Volver al detalle
              </button>
            </div>
            <ProcessDefinitionForm
              initialData={process}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-emerald-50/20 rounded-xl shadow-lg border border-emerald-100/30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/procesos/definiciones')}
              className="hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {process.nombre}
              </h1>
              <p className="text-emerald-700 font-medium">
                Código: {process.codigo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={
                process.estado === 'activo'
                  ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                  : 'bg-gray-100 text-gray-800 shadow-sm'
              }
            >
              {process.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
            <Button
              onClick={() => setEditing(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Contenido del proceso */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent border-b border-emerald-100/50">
                <CardTitle className="text-emerald-800">
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-4 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <h3 className="font-medium text-gray-900 mb-2">Objetivo</h3>
                  <p className="mt-1 text-gray-600">{process.objetivo}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <h3 className="font-medium text-gray-900 mb-2">Alcance</h3>
                  <p className="mt-1 text-gray-600">{process.alcance}</p>
                </div>
                <div className="p-4 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Responsable
                  </h3>
                  <p className="mt-1 text-gray-600">{process.responsable}</p>
                </div>
              </CardContent>
            </Card>

            {/* Secciones colapsables */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/20">
              <CardContent className="p-0">
                {renderArrayField('Entradas', process.entradas, 'entradas')}
                {renderArrayField('Salidas', process.salidas, 'salidas')}
                {renderArrayField('Controles', process.controles, 'controles')}
                {renderArrayField(
                  'Indicadores',
                  process.indicadores,
                  'indicadores'
                )}
                {renderArrayField(
                  'Documentos',
                  process.documentos,
                  'documentos'
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Registro de Procesos */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent border-b border-emerald-100/50">
                <CardTitle className="text-emerald-800">
                  Registro de Procesos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Documentos Relacionados */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Documentos Relacionados
                  </h4>
                  <div className="space-y-1">
                    {process.documentos && process.documentos.length > 0 ? (
                      process.documentos.slice(0, 3).map((doc, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        >
                          <span className="text-sm text-gray-600">{doc}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-gray-50/50 rounded text-sm text-gray-500 italic">
                        No hay documentos definidos
                      </div>
                    )}
                    {process.documentos && process.documentos.length > 3 && (
                      <div className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-700">
                        +{process.documentos.length - 3} más...
                      </div>
                    )}
                  </div>
                </div>

                {/* Puntos de la Norma */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Puntos de la Norma
                  </h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        ISO 9001:2015 - Cláusula 4.4
                      </span>
                    </div>
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        ISO 9001:2015 - Cláusula 8.1
                      </span>
                    </div>
                  </div>
                </div>

                {/* Objetivos de Calidad */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Objetivos de Calidad
                  </h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Mejorar satisfacción del cliente
                      </span>
                    </div>
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Reducir tiempo de entrega
                      </span>
                    </div>
                    <div className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-700">
                      +2 más...
                    </div>
                  </div>
                </div>

                {/* Indicadores de Calidad */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Indicadores de Calidad
                  </h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Tiempo promedio de entrega
                      </span>
                    </div>
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Nivel de satisfacción
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mediciones */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Mediciones
                  </h4>
                  <div className="space-y-1">
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Medición Q1 2024
                      </span>
                    </div>
                    <div className="p-2 bg-white/60 rounded border border-emerald-100/30 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                      <span className="text-sm text-gray-600">
                        Medición Q2 2024
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón para ver todos los registros */}
                <div className="pt-4 border-t border-emerald-100/30">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => router.push(`/procesos/registros`)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Todos los Registros
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/20">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent border-b border-emerald-100/50">
                <CardTitle className="text-emerald-800">
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-3 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <p className="text-sm text-gray-500 mb-1">Creado</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(process.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <p className="text-sm text-gray-500 mb-1">
                    Última actualización
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(process.updatedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="p-3 bg-white/60 rounded-lg shadow-sm border border-emerald-100/30">
                  <p className="text-sm text-gray-500 mb-1">ID</p>
                  <p className="text-sm font-mono break-all text-gray-700">
                    {process.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
