'use client';

import { CreateOrganizationDialog } from '@/components/super-admin/CreateOrganizationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Calendar, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function OrganizacionesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que el usuario sea super admin
    if (user && user.rol !== 'super_admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchOrganizations();
    }
  }, [user, router]);

  const fetchOrganizations = async () => {
    try {
      setError(null);
      const res = await fetch('/api/super-admin/organizations');
      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error || data?.message || 'Error de autorizacion o carga.'
        );
      }

      if (data.organizations) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Error al cargar organizaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando organizaciones...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Organizaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Panel de administración multi-tenant
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Organización
        </Button>
      </div>
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Organizaciones
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {organizations.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plan Enterprise
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {organizations.filter(o => o.plan === 'enterprise').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creadas este mes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {
                    organizations.filter(o => {
                      const created = new Date(o.created_at);
                      const now = new Date();
                      return created.getMonth() === now.getMonth();
                    }).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.map(org => (
              <div
                key={org.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() =>
                  router.push(`/super-admin/organizaciones/${org.id}`)
                }
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {org.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Plan: {org.plan}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Max usuarios: {org.features.max_users}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {org.features.private_sections && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Secciones Privadas
                      </span>
                    )}
                    {org.features.ai_assistant && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        IA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {organizations.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No hay organizaciones creadas
                </p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4"
                >
                  Crear primera organización
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchOrganizations}
      />
    </div>
  );
}
