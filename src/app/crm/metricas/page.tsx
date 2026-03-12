'use client';

import { ActionTypeBadge } from '@/components/crm/actions/ActionTypeBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { CRMAccion } from '@/types/crmAcciones';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CRMMetricsPage() {
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  const [loading, setLoading] = useState(true);
  const [acciones, setAcciones] = useState<CRMAccion[]>([]);
  const [rangoFecha, setRangoFecha] = useState('30'); // DÃ­as

  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) return;
      setLoading(true);
      try {
        // Calcular fecha desde
        const desde = new Date();
        desde.setDate(desde.getDate() - parseInt(rangoFecha));

        const params = new URLSearchParams({
          organization_id: organizationId,
          fecha_desde: desde.toISOString(),
        });

        const res = await fetch(`/api/crm/acciones?${params.toString()}`);
        const data = await res.json();

        if (data.success && data.data) {
          // Filtrar localmente por fecha si la API no filtra estricto
          const filtered = (data.data as CRMAccion[]).filter(
            a => new Date(a.createdAt) >= desde
          );
          setAcciones(filtered);
        }
      } catch (error) {
        console.error('Error loading metrics data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [organizationId, rangoFecha]);

  const calculateKPIs = () => {
    const total = acciones.length;
    const completed = acciones.filter(a => a.estado === 'completada');
    const overdue = acciones.filter(
      a =>
        a.estado === 'vencida' ||
        (a.estado === 'programada' &&
          a.fecha_programada &&
          new Date(a.fecha_programada) < new Date())
    );

    // Eficacia: Ventas / Acciones Completadas
    const ventas = completed.filter(a => a.resultado === 'venta').length;
    const eficacia =
      completed.length > 0 ? (ventas / completed.length) * 100 : 0;

    // Velocidad: Promedio (Realizada - Programada) en horas
    let totalHorasDemora = 0;
    let countDemora = 0;
    completed.forEach(a => {
      if (a.fecha_programada && a.fecha_realizada) {
        const diff =
          new Date(a.fecha_realizada).getTime() -
          new Date(a.fecha_programada).getTime();
        if (diff > 0) {
          // Solo si se atrasÃ³
          totalHorasDemora += diff / (1000 * 60 * 60);
          countDemora++;
        }
      }
    });
    const velocidadPromedio =
      countDemora > 0 ? totalHorasDemora / countDemora : 0;

    // Mix por Tipo
    const mix: Record<string, number> = {};
    acciones.forEach(a => {
      mix[a.tipo] = (mix[a.tipo] || 0) + 1;
    });

    // Ranking Vendedores
    const ranking: Record<
      string,
      { name: string; count: number; ventas: number }
    > = {};
    acciones.forEach(a => {
      if (!ranking[a.vendedor_id]) {
        ranking[a.vendedor_id] = {
          name: a.vendedor_nombre || 'Desconocido',
          count: 0,
          ventas: 0,
        };
      }
      ranking[a.vendedor_id].count++;
      if (a.resultado === 'venta') ranking[a.vendedor_id].ventas++;
    });
    const topVendedores = Object.values(ranking)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total,
      completed: completed.length,
      overdue: overdue.length,
      eficacia,
      velocidadPromedio,
      mix,
      topVendedores,
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <BarChart3 className="text-purple-600" />
            MÃ©tricas de Actividad
          </h1>
          <p className="text-gray-500 text-sm">
            Rendimiento del equipo basado en acciones reales
          </p>
        </div>
        <div className="w-48">
          <Select value={rangoFecha} onValueChange={setRangoFecha}>
            <SelectTrigger>
              <SelectValue placeholder="Rango de fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ãšltimos 7 dÃ­as</SelectItem>
              <SelectItem value="30">Ãšltimos 30 dÃ­as</SelectItem>
              <SelectItem value="90">Ãšltimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Calculando mÃ©tricas...
        </div>
      ) : (
        <>
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Acciones Totales
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis.total}</div>
                <p className="text-xs text-gray-400 mt-1">
                  En el periodo seleccionado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Realizadas vs Vencidas
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {kpis.completed}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">/</span>
                  <span className="text-xl font-semibold text-red-500">
                    {kpis.overdue}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Completadas vs Pendientes Vencidas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Eficacia de Ventas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis.eficacia.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Acciones que resultaron en venta
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Velocidad Promedio
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis.velocidadPromedio.toFixed(1)} hrs
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Demora promedio de seguimiento
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mix de Acciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mix de Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(kpis.mix)
                    .sort(([, a], [, b]) => b - a)
                    .map(([tipo, count]) => (
                      <div
                        key={tipo}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <ActionTypeBadge
                            tipo={tipo as any}
                            showLabel={false}
                            className="w-6 h-6"
                          />
                          <span className="capitalize text-sm font-medium">
                            {tipo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 w-1/2">
                          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(count / kpis.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Ranking Vendedores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Actividad por Vendedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpis.topVendedores.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{v.name}</div>
                          <div className="text-xs text-gray-500 text-green-600 font-medium">
                            {v.ventas} ventas generadas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {v.count}
                        </div>
                        <div className="text-xs text-gray-400">acciones</div>
                      </div>
                    </div>
                  ))}
                  {kpis.topVendedores.length === 0 && (
                    <p className="text-center text-gray-400 py-4">
                      No hay actividad registrada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
