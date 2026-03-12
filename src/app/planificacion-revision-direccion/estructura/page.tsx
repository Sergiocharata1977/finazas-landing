'use client';

import { PlanificacionListing } from '@/components/planificacion/PlanificacionListing';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Users } from 'lucide-react';

export default function EstructuraPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user?.organization_id) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-600">Error: No se encontró la organización</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlanificacionListing
          tipo="estructura"
          organizationId={user.organization_id}
          userEmail={user.email || ''}
          icon={Users}
        />
      </div>
    </div>
  );
}
