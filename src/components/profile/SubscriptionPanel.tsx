'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, Crown, Loader2, Zap } from 'lucide-react';
import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'BASIC',
    name: 'Plan Básico',
    price: 5000,
    description: 'Ideal para pequeñas empresas',
    features: [
      'Hasta 5 usuarios',
      'Módulos básicos ISO 9001',
      'Soporte por email',
      'Almacenamiento 5GB',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Plan Premium',
    price: 15000,
    description: 'Para empresas en crecimiento',
    features: [
      'Usuarios ilimitados',
      'Todos los módulos ISO',
      'Soporte prioritario 24/7',
      'Almacenamiento ilimitado',
      'Integraciones avanzadas',
      'Reportes personalizados',
    ],
    popular: true,
  },
];

interface SubscriptionPanelProps {
  userId: string;
  userEmail: string;
  userName?: string;
  currentPlan?: 'trial' | 'basic' | 'premium' | 'none';
}

export function SubscriptionPanel({
  userId,
  userEmail,
  userName,
  currentPlan = 'trial',
}: SubscriptionPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setError(null);

    try {
      const response = await fetch('/api/billing/mobbex/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          userName: userName || userEmail.split('@')[0],
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar suscripción');
      }

      // Redirect to Mobbex checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Elige tu Plan</h2>
        <p className="text-muted-foreground mt-2">
          Actualiza tu cuenta para acceder a todas las funcionalidades
        </p>
        {currentPlan === 'trial' && (
          <Badge variant="outline" className="mt-2">
            Actualmente en período de prueba
          </Badge>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map(plan => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">
                  <Crown className="w-3 h-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                {plan.id === 'PREMIUM' ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Zap className="w-5 h-5 text-blue-500" />
                )}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold">
                  ${plan.price.toLocaleString('es-AR')}
                </span>
                <span className="text-muted-foreground">/mes</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Suscribirse'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pagos procesados de forma segura por Mobbex. Puedes cancelar en
        cualquier momento.
      </p>
    </div>
  );
}
