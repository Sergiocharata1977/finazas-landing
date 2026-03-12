'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySize, FunctionalLevel, LevelStatus } from '@/types/maturity';
import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface GlobalMaturityDonutProps {
  levels: Record<FunctionalLevel, LevelStatus>;
  companySize?: CompanySize;
  className?: string;
}

// Pesos según tamaño de empresa (copiado de calculator.ts para evitar import circular)
const SIZE_WEIGHTS: Record<CompanySize, Record<FunctionalLevel, number>> = {
  micro: {
    [FunctionalLevel.LEVEL_1_OPERATION]: 0.45,
    [FunctionalLevel.LEVEL_2_SUPPORT]: 0.2,
    [FunctionalLevel.LEVEL_3_CONTROL]: 0.2,
    [FunctionalLevel.LEVEL_4_DIRECTION]: 0.15,
  },
  small: {
    [FunctionalLevel.LEVEL_1_OPERATION]: 0.4,
    [FunctionalLevel.LEVEL_2_SUPPORT]: 0.2,
    [FunctionalLevel.LEVEL_3_CONTROL]: 0.2,
    [FunctionalLevel.LEVEL_4_DIRECTION]: 0.2,
  },
  medium: {
    [FunctionalLevel.LEVEL_1_OPERATION]: 0.3,
    [FunctionalLevel.LEVEL_2_SUPPORT]: 0.25,
    [FunctionalLevel.LEVEL_3_CONTROL]: 0.25,
    [FunctionalLevel.LEVEL_4_DIRECTION]: 0.2,
  },
  large: {
    [FunctionalLevel.LEVEL_1_OPERATION]: 0.25,
    [FunctionalLevel.LEVEL_2_SUPPORT]: 0.25,
    [FunctionalLevel.LEVEL_3_CONTROL]: 0.25,
    [FunctionalLevel.LEVEL_4_DIRECTION]: 0.25,
  },
};

const LEVEL_NAMES: Record<FunctionalLevel, string> = {
  [FunctionalLevel.LEVEL_1_OPERATION]: 'Operación',
  [FunctionalLevel.LEVEL_2_SUPPORT]: 'Apoyo',
  [FunctionalLevel.LEVEL_3_CONTROL]: 'Control',
  [FunctionalLevel.LEVEL_4_DIRECTION]: 'Dirección',
};

const LEVEL_COLORS: Record<FunctionalLevel, string> = {
  [FunctionalLevel.LEVEL_1_OPERATION]: '#3b82f6', // Blue
  [FunctionalLevel.LEVEL_2_SUPPORT]: '#10b981', // Green
  [FunctionalLevel.LEVEL_3_CONTROL]: '#f59e0b', // Amber
  [FunctionalLevel.LEVEL_4_DIRECTION]: '#8b5cf6', // Violet
};

export const GlobalMaturityDonut: React.FC<GlobalMaturityDonutProps> = ({
  levels,
  companySize = 'small',
  className,
}) => {
  const { chartData, globalScore } = useMemo(() => {
    const weights = SIZE_WEIGHTS[companySize] || SIZE_WEIGHTS.small;

    // Calcular aporte de cada nivel al global (ponderado)
    const segments = Object.values(FunctionalLevel).map(levelKey => {
      const levelData = levels[levelKey];
      const score = levelData?.score || 0;
      const weight = weights[levelKey] || 0.25;

      // Valor del segmento = score * peso (da el aporte real al global)
      const value = Math.round(score * weight);

      return {
        name: LEVEL_NAMES[levelKey],
        value: value,
        score: score,
        weight: Math.round(weight * 100),
        color: LEVEL_COLORS[levelKey],
        level: levelKey,
      };
    });

    // Score global = suma de aportes
    const total = segments.reduce((sum, s) => sum + s.value, 0);

    return {
      chartData: segments,
      globalScore: total,
    };
  }, [levels, companySize]);

  // Datos para el centro del donut
  const centerLabel = `${globalScore}%`;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-700">
          Madurez Global ISO 9001
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white rounded-lg shadow-lg border p-3 text-sm">
                        <p
                          className="font-medium"
                          style={{ color: data.color }}
                        >
                          {data.name}
                        </p>
                        <p className="text-gray-600">
                          Score: {data.score}% × Peso: {data.weight}%
                        </p>
                        <p className="text-gray-800 font-medium">
                          Aporte: {data.value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centro del donut */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-800">
                {centerLabel}
              </span>
              <p className="text-xs text-gray-500">Global</p>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map(item => (
            <div key={item.level} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">
                {item.name}: {item.score}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
