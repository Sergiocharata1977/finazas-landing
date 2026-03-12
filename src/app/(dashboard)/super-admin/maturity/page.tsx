'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MaturityLevel } from '@/types/maturity';
import {
  BarChart3,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface OrgMaturitySummary {
  organizationId: string;
  name: string;
  plan: string;
  maturityLevel: MaturityLevel;
  maturityScore: number;
  lastUpdated: string | null;
  companySize: string;
}

const LEVEL_COLORS: Record<MaturityLevel, string> = {
  [MaturityLevel.INICIAL]: 'bg-gray-100 text-gray-800',
  [MaturityLevel.ORDENADO]: 'bg-blue-100 text-blue-800',
  [MaturityLevel.CONTROLADO]: 'bg-indigo-100 text-indigo-800',
  [MaturityLevel.MADURO]: 'bg-green-100 text-green-800',
  [MaturityLevel.EXCELENTE]: 'bg-purple-100 text-purple-800',
};

export default function SuperAdminMaturityPage() {
  const [data, setData] = useState<OrgMaturitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/maturity');
      if (res.ok) {
        const json = await res.json();
        setData(json.organizations);
      }
    } catch (error) {
      console.error('Error fetching admin maturity data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(
    org =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.organizationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Monitor de Organizaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Visión global del estado de madurez de todos los clientes.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCcw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Listado General</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar organización..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan / Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score Global
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Act.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2 block">
                        Cargando datos...
                      </span>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No se encontraron organizaciones.
                    </td>
                  </tr>
                ) : (
                  filteredData.map(org => (
                    <tr key={org.organizationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {org.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {org.organizationId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">
                          {org.companySize || '-'}
                        </div>
                        <div className="text-xs text-gray-500">{org.plan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`text-lg font-bold ${
                              org.maturityScore >= 80
                                ? 'text-green-600'
                                : org.maturityScore >= 50
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                            }`}
                          >
                            {org.maturityScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={`${LEVEL_COLORS[org.maturityLevel]} hover:${LEVEL_COLORS[org.maturityLevel]} border-0`}
                        >
                          {org.maturityLevel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {org.lastUpdated
                          ? new Date(org.lastUpdated).toLocaleDateString()
                          : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/super-admin/organizaciones/${org.organizationId}`}
                          >
                            Ver <ExternalLink className="h-3 w-3 ml-2" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
