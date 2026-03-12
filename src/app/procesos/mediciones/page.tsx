'use client';

import { MeasurementFormDialog } from '@/components/quality/MeasurementFormDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Measurement } from '@/types/quality';
import { Activity, Calendar, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MedicionesListing() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [indicatorFilter, setIndicatorFilter] = useState<string>('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [indicators, setIndicators] = useState<any[]>([]);

  useEffect(() => {
    fetchMeasurements();
    fetchIndicators();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await fetch('/api/quality/measurements');
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data);
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndicators = async () => {
    try {
      const response = await fetch('/api/quality/indicators');
      if (response.ok) {
        const data = await response.json();
        setIndicators(data || []);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    }
  };

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch =
      measurement.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measurement.observations
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;

    const matchesIndicator =
      indicatorFilter === 'all' || measurement.indicator_id === indicatorFilter;

    return matchesSearch && matchesIndicator;
  });

  const getIndicatorName = (indicatorId: string) => {
    const indicator = indicators.find(i => i.id === indicatorId);
    return indicator
      ? `${indicator.code} - ${indicator.name}`
      : 'Indicador desconocido';
  };

  const getIndicatorUnit = (indicatorId: string) => {
    const indicator = indicators.find(i => i.id === indicatorId);
    return indicator?.unit || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando mediciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mediciones de Calidad
          </h1>
          <p className="text-gray-600 mt-1">
            Registro y validación de valores medidos
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Medición
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar mediciones..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={indicatorFilter} onValueChange={setIndicatorFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Todos los indicadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los indicadores</SelectItem>
                {indicators.map(ind => (
                  <SelectItem key={ind.id} value={ind.id}>
                    {ind.code} - {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeasurements.map(measurement => (
          <Link
            key={measurement.id}
            href={`/procesos/mediciones/${measurement.id}`}
            className="block"
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {measurement.code}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {getIndicatorName(measurement.indicator_id)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Valor */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {measurement.value}{' '}
                    {getIndicatorUnit(measurement.indicator_id)}
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(measurement.measurement_date).toLocaleDateString(
                    'es-ES'
                  )}
                </div>

                {/* Observaciones */}
                {measurement.observations && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                    {measurement.observations}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredMeasurements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron mediciones
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || indicatorFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza registrando tu primera medición de calidad'}
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Medición
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog for creating new measurement */}
      <MeasurementFormDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={() => {
          setShowNewDialog(false);
          fetchMeasurements();
        }}
      />
    </div>
  );
}
