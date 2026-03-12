'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Check } from 'lucide-react';

export default function SubscriptionPage() {
  const { user } = useAuth();
  // En una implementación real, aquí leeríamos los planes de Firestore

  const isExpired = true; // Esto lo determinaríamos con la lógica de usuario

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">Planes y Suscripción</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tu organización. Comienza con una
          prueba gratuita y escala según tus necesidades.
        </p>
      </div>

      {isExpired && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 flex items-center gap-3 max-w-3xl mx-auto">
          <AlertTriangle className="text-amber-500 w-6 h-6" />
          <div>
            <h3 className="font-semibold text-amber-500">
              Tu periodo de prueba ha finalizado
            </h3>
            <p className="text-amber-600/80 text-sm">
              Por favor selecciona un plan para continuar accediendo al sistema.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Plan Trial */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm opacity-75">
          <CardHeader>
            <CardTitle>Prueba Gratuita</CardTitle>
            <CardDescription>Para evaluar la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              $0{' '}
              <span className="text-sm font-normal text-slate-500">/ mes</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> Acceso completo
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> 30 días de
                duración
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> Soporte básico
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Plan Actual (Expirado)
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Basic */}
        <Card className="border-emerald-500/50 bg-slate-900 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-3 py-1 font-bold">
            RECOMENDADO
          </div>
          <CardHeader>
            <CardTitle className="text-emerald-400">Plan Profesional</CardTitle>
            <CardDescription>Para pequeñas y medianas empresas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4 text-white">
              $49{' '}
              <span className="text-sm font-normal text-slate-500">/ mes</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" /> Usuarios
                ilimitados
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" /> Gestión de
                Calidad completa
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" /> Almacenamiento
                50GB
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" /> Soporte
                prioritario
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Contactar Ventas
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Enterprise */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>Para grandes organizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">Consultar</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> Multi-tenant
                nativo
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> API dedicada
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> SLA garantizado
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500" /> Onboarding
                personalizado
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Contactar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
