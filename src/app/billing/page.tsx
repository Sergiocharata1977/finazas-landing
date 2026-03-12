'use client';

import { SubscriptionPanel } from '@/components/profile/SubscriptionPanel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Loader2, LogOut, Shield } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Si no hay usuario, redirigir a login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si el usuario ya tiene plan activo, redirigir al dashboard
  if (user.planType === 'premium' || user.planType === 'basic') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950/20">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icono.png"
              alt="9001App"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="font-bold text-lg">9001App</h1>
              <p className="text-xs text-muted-foreground">Sistema ISO 9001</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-lg">
            <CreditCard className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Activa tu Suscripción
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu período de prueba está activo. Elige un plan para desbloquear
            todas las funcionalidades de gestión ISO 9001.
          </p>
        </div>

        {/* Subscription Panel */}
        <SubscriptionPanel
          userId={user.id}
          userEmail={user.email || ''}
          currentPlan={user.planType || 'trial'}
        />

        {/* Security Badge */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-sm">
              Transacciones seguras procesadas por Mobbex (PCI DSS Compliant)
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Puedes cancelar tu suscripción en cualquier momento. Todos los datos
            están protegidos con encriptación de grado bancario.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 9001App - Sistema de Gestión de Calidad ISO 9001:2015</p>
        </div>
      </footer>
    </div>
  );
}
