'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Trash2, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Organization {
  id: string;
  name: string;
  plan: string;
  settings: {
    timezone: string;
    currency: string;
    language: string;
  };
  features: {
    private_sections: boolean;
    ai_assistant: boolean;
    max_users: number;
  };
  created_at: any;
  updated_at: any;
}

export default function OrganizacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.rol !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    if (params.orgId) {
      fetchOrganization();
    }
  }, [params.orgId, user, router]);

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/super-admin/organizations/${params.orgId}`);
      const data = await res.json();

      if (data.organization) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('Error al cargar organización:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const res = await fetch(
        `/api/super-admin/organizations/${params.orgId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(organization),
        }
      );

      if (!res.ok) throw new Error('Error al guardar');

      alert('Organización actualizada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        '¿Estás seguro de eliminar esta organización? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/super-admin/organizations/${params.orgId}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) throw new Error('Error al eliminar');

      router.push('/super-admin/organizaciones');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar organización');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8">
        <p className="text-gray-600 dark:text-gray-400">
          Organización no encontrada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/super-admin/organizaciones')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              ID: {organization.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={organization.name}
                onChange={e =>
                  setOrganization({ ...organization, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Plan</Label>
              <Input
                value={organization.plan}
                onChange={e =>
                  setOrganization({ ...organization, plan: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Zona Horaria</Label>
              <Input
                value={organization.settings.timezone}
                onChange={e =>
                  setOrganization({
                    ...organization,
                    settings: {
                      ...organization.settings,
                      timezone: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div>
              <Label>Moneda</Label>
              <Input
                value={organization.settings.currency}
                onChange={e =>
                  setOrganization({
                    ...organization,
                    settings: {
                      ...organization.settings,
                      currency: e.target.value,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Características</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Máximo de Usuarios</Label>
              <Input
                type="number"
                value={organization.features.max_users}
                onChange={e =>
                  setOrganization({
                    ...organization,
                    features: {
                      ...organization.features,
                      max_users: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organization.features.private_sections}
                  onChange={e =>
                    setOrganization({
                      ...organization,
                      features: {
                        ...organization.features,
                        private_sections: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Secciones Privadas</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organization.features.ai_assistant}
                  onChange={e =>
                    setOrganization({
                      ...organization,
                      features: {
                        ...organization.features,
                        ai_assistant: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Asistente IA</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios de la Organización</CardTitle>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/super-admin/organizaciones/${params.orgId}/usuarios`
                )
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Gestiona los usuarios que pertenecen a esta organización
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
