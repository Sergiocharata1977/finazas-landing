'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MaturityRecommendation } from '@/types/maturity';
import {
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface NextStepsProps {
  recommendations: MaturityRecommendation[];
}

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
};

const PRIORITY_LABELS = {
  high: 'Alta Prioridad',
  medium: 'Mejora',
  low: 'Sugerencia',
};

const PRIORITY_ICONS = {
  high: ShieldAlert,
  medium: TrendingUp,
  low: CheckCircle2,
};

export const NextSteps: React.FC<NextStepsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
          <CardDescription>
            ¡Excelente! No hay acciones pendientes urgentes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Plan de Acción Sugerido
        </CardTitle>
        <CardDescription>
          Acciones de mayor impacto para mejorar tu madurez organizacional en
          los próximos 30 días.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.slice(0, 5).map(rec => {
          const Icon = PRIORITY_ICONS[rec.priority];
          return (
            <div
              key={rec.id}
              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border ${PRIORITY_STYLES[rec.priority]} transition-all hover:shadow-sm`}
            >
              <div className="flex-shrink-0 mt-1">
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {PRIORITY_LABELS[rec.priority]}
                  </span>
                  <span className="text-xs text-gray-500">
                    • Impacto en {rec.impactLevel}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                <p className="text-sm opacity-90 mb-3">{rec.description}</p>

                {rec.actionUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 hover:bg-white text-xs h-8"
                    asChild
                  >
                    <Link href={rec.actionUrl}>
                      Resolver ahora <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
