'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunctionalLevel, LevelStatus } from '@/types/maturity';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface LevelDetailChartsProps {
  levels: Record<FunctionalLevel, LevelStatus>;
}

const LEVEL_TITLES: Record<FunctionalLevel, string> = {
  [FunctionalLevel.LEVEL_1_OPERATION]: 'Nivel 1: Operación Diaria',
  [FunctionalLevel.LEVEL_2_SUPPORT]: 'Nivel 2: Estructura de Apoyo',
  [FunctionalLevel.LEVEL_3_CONTROL]: 'Nivel 3: Control y Mejora',
  [FunctionalLevel.LEVEL_4_DIRECTION]: 'Nivel 4: Dirección Estratégica',
};

const LEVEL_COLORS: Record<FunctionalLevel, string> = {
  [FunctionalLevel.LEVEL_1_OPERATION]: '#3b82f6', // Blue
  [FunctionalLevel.LEVEL_2_SUPPORT]: '#10b981', // Green
  [FunctionalLevel.LEVEL_3_CONTROL]: '#f59e0b', // Amber
  [FunctionalLevel.LEVEL_4_DIRECTION]: '#8b5cf6', // Violet
};

export const LevelDetailCharts: React.FC<LevelDetailChartsProps> = ({
  levels,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.values(FunctionalLevel).map(levelKey => {
        const levelData = levels[levelKey];
        if (!levelData) return null;

        const color = LEVEL_COLORS[levelKey];

        // Datos para el donut del nivel
        const donutData = [
          { name: 'Completado', value: levelData.score, color: color },
          { name: 'Pendiente', value: 100 - levelData.score, color: '#e5e7eb' },
        ];

        return (
          <Card key={levelKey} className="flex flex-col h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-medium text-gray-700">
                  {LEVEL_TITLES[levelKey]}
                </CardTitle>
                <span className="text-xl font-bold" style={{ color }}>
                  {levelData.score}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-2">
              <div className="flex gap-4">
                {/* Donut del nivel */}
                <div className="relative w-[120px] h-[120px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white rounded-lg shadow-lg border p-2 text-xs">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-gray-600">{data.value}%</p>
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
                    <span className="text-lg font-bold" style={{ color }}>
                      {levelData.score}%
                    </span>
                  </div>
                </div>

                {/* Lista de tareas del nivel */}
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {levelData.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span
                        className={`truncate ${task.score > 0 ? 'text-gray-700' : 'text-gray-400'}`}
                        title={task.name}
                      >
                        {task.name}
                      </span>
                      <span
                        className={`ml-2 font-medium ${task.score > 0 ? 'text-gray-800' : 'text-gray-300'}`}
                      >
                        {task.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
