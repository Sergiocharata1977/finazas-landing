'use client';

import { AnalisisFODA } from '@/types/analisis-foda';
import { Filter, Plus, Target, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnalisisFODAPage() {
  const router = useRouter();
  const [analisis, setAnalisis] = useState<AnalisisFODA[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingAnalisis, setEditingAnalisis] = useState<AnalisisFODA | null>(
    null
  );
  const [formData, setFormData] = useState<{
    titulo: string;
    tipo_analisis: 'organizacional' | 'proceso' | 'departamento' | 'proyecto';
    descripcion: string;
    fortalezas: string;
    oportunidades: string;
    debilidades: string;
    amenazas: string;
    fecha_analisis: string;
    estado: 'en_proceso' | 'completado' | 'archivado';
  }>({
    titulo: '',
    tipo_analisis: 'organizacional',
    descripcion: '',
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: '',
    fecha_analisis: new Date().toISOString().split('T')[0],
    estado: 'en_proceso',
  });

  useEffect(() => {
    loadAnalisis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadAnalisis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ organization_id: 'default-org' });
      if (filter !== 'all') params.append('estado', filter);

      const response = await fetch(`/api/analisis-foda?${params}`);
      const data = await response.json();
      // Asegurar que siempre sea un array
      setAnalisis(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error loading analisis:', error);
      setAnalisis([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      en_proceso: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      archivado: 'bg-gray-100 text-gray-800',
    };
    return colors[estado as keyof typeof colors] || colors.en_proceso;
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      organizacional: 'Organizacional',
      proceso: 'Proceso',
      departamento: 'Departamento',
      proyecto: 'Proyecto',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const handleCreate = () => {
    setEditingAnalisis(null);
    setFormData({
      titulo: '',
      tipo_analisis: 'organizacional',
      descripcion: '',
      fortalezas: '',
      oportunidades: '',
      debilidades: '',
      amenazas: '',
      fecha_analisis: new Date().toISOString().split('T')[0],
      estado: 'en_proceso',
    });
    setShowDialog(true);
  };

  const handleEdit = (analisis: AnalisisFODA) => {
    setEditingAnalisis(analisis);
    setFormData({
      titulo: analisis.titulo,
      tipo_analisis: analisis.tipo_analisis,
      descripcion: analisis.descripcion || '',
      fortalezas: analisis.fortalezas.join('\n'),
      oportunidades: analisis.oportunidades.join('\n'),
      debilidades: analisis.debilidades.join('\n'),
      amenazas: analisis.amenazas.join('\n'),
      fecha_analisis: analisis.fecha_analisis.split('T')[0],
      estado: analisis.estado,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAnalisis
        ? `/api/analisis-foda/${editingAnalisis.id}`
        : '/api/analisis-foda';
      const method = editingAnalisis ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        organization_id: 'default-org',
        fortalezas: formData.fortalezas.split('\n').filter(f => f.trim()),
        oportunidades: formData.oportunidades.split('\n').filter(o => o.trim()),
        debilidades: formData.debilidades.split('\n').filter(d => d.trim()),
        amenazas: formData.amenazas.split('\n').filter(a => a.trim()),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(
          editingAnalisis
            ? 'Análisis actualizado correctamente'
            : 'Análisis creado correctamente'
        );
        setShowDialog(false);
        loadAnalisis();
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || 'No se pudo guardar el análisis'}`);
      }
    } catch (error) {
      console.error('Error saving analisis:', error);
      alert('Error al guardar el análisis');
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (
      !confirm(`¿Estás seguro de que deseas eliminar el análisis "${titulo}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/analisis-foda/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Análisis eliminado correctamente');
        loadAnalisis();
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || 'No se pudo eliminar el análisis'}`);
      }
    } catch (error) {
      console.error('Error deleting analisis:', error);
      alert('Error al eliminar el análisis');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Análisis FODA</h1>
          <p className="text-gray-600 mt-1">
            Fortalezas, Oportunidades, Debilidades y Amenazas
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Análisis
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="en_proceso">En Proceso</option>
            <option value="completado">Completados</option>
            <option value="archivado">Archivados</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis...</p>
        </div>
      ) : analisis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay análisis FODA
          </h3>
          <p className="text-gray-500">
            Comienza creando tu primer análisis estratégico
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {analisis.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-gray-500">
                      {item.codigo}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {getTipoLabel(item.tipo_analisis)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadge(item.estado)}`}
                    >
                      {item.estado.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.titulo}
                  </h3>
                  {item.descripcion && (
                    <p className="text-gray-600 mb-3">{item.descripcion}</p>
                  )}
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {item.fortalezas.length}
                      </div>
                      <div className="text-xs text-green-600">Fortalezas</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {item.oportunidades.length}
                      </div>
                      <div className="text-xs text-blue-600">Oportunidades</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {item.debilidades.length}
                      </div>
                      <div className="text-xs text-yellow-600">Debilidades</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {item.amenazas.length}
                      </div>
                      <div className="text-xs text-red-600">Amenazas</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      Fecha:{' '}
                      {new Date(item.fecha_analisis).toLocaleDateString()}
                    </span>
                    {item.responsable_nombre && (
                      <span>Responsable: {item.responsable_nombre}</span>
                    )}
                    {item.participantes.length > 0 && (
                      <span>{item.participantes.length} participantes</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      alert('Funcionalidad de ver matriz próximamente')
                    }
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver Matriz
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Editar
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(item.id, item.titulo)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  title="Eliminar análisis"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white rounded-t-lg">
              <h2 className="text-2xl font-bold">
                {editingAnalisis
                  ? 'Editar Análisis FODA'
                  : 'Nuevo Análisis FODA'}
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={e =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Análisis FODA Organizacional 2025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Análisis *
                    </label>
                    <select
                      value={formData.tipo_analisis}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          tipo_analisis: e.target.value as
                            | 'organizacional'
                            | 'proceso'
                            | 'departamento'
                            | 'proyecto',
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="organizacional">Organizacional</option>
                      <option value="proceso">Proceso</option>
                      <option value="departamento">Departamento</option>
                      <option value="proyecto">Proyecto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={e =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    placeholder="Descripción breve del análisis"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">💪</span> Fortalezas
                      </h3>
                      <textarea
                        value={formData.fortalezas}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            fortalezas: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={5}
                        placeholder="Ingrese las fortalezas (una por línea)"
                      />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">⚠️</span> Debilidades
                      </h3>
                      <textarea
                        value={formData.debilidades}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            debilidades: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={5}
                        placeholder="Ingrese las debilidades (una por línea)"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">🎯</span> Oportunidades
                      </h3>
                      <textarea
                        value={formData.oportunidades}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            oportunidades: e.target.value,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={5}
                        placeholder="Ingrese las oportunidades (una por línea)"
                      />
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <span className="text-xl">⚡</span> Amenazas
                      </h3>
                      <textarea
                        value={formData.amenazas}
                        onChange={e =>
                          setFormData({ ...formData, amenazas: e.target.value })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        rows={5}
                        placeholder="Ingrese las amenazas (una por línea)"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Análisis *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_analisis}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          fecha_analisis: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          estado: e.target.value as
                            | 'en_proceso'
                            | 'completado'
                            | 'archivado',
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="en_proceso">En Proceso</option>
                      <option value="completado">Completado</option>
                      <option value="archivado">Archivado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingAnalisis ? 'Guardar Cambios' : 'Crear Análisis'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
