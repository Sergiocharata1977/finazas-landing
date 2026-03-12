'use client';

import { ExportDropdown } from '@/components/mcp/ExportDropdown';
import { ExportToSheetsDialog } from '@/components/mcp/ExportToSheetsDialog';
import { MCPExecutionList } from '@/components/mcp/MCPExecutionList';
import { TaskTemplateSelector } from '@/components/mcp/TaskTemplateSelector';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MCPTaskExecution } from '@/types/mcp';
import {
  Activity,
  AlertCircle,
  Bot,
  CheckCircle,
  Clock,
  History,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MCPTab() {
  const { user, loading: authLoading } = useAuth();
  const [recentExecutions, setRecentExecutions] = useState<MCPTaskExecution[]>(
    []
  );
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    fail: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organization_id) {
      fetchData(user.organization_id);
    }
  }, [user]);

  const fetchData = async (orgId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/mcp/ejecuciones?organization_id=${orgId}&limit=10`
      );
      const data = await res.json();

      if (data.success && data.data) {
        setRecentExecutions(data.data);
        const total = data.data.length;
        const success = data.data.filter(
          (e: MCPTaskExecution) => e.estado === 'exitoso'
        ).length;
        const fail = data.data.filter(
          (e: MCPTaskExecution) => e.estado === 'fallido'
        ).length;
        const duration =
          data.data.reduce(
            (acc: number, curr: MCPTaskExecution) =>
              acc + (curr.duracion_ms || 0),
            0
          ) / (total || 1);
        setStats({ total, success, fail, avgDuration: Math.round(duration) });
      }
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
            <Bot className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-sm text-slate-500">Cargando panel MCP...</p>
        </div>
      </div>
    );
  }

  const successRate = stats.total
    ? Math.round((stats.success / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Panel MCP</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Monitor de automatización inteligente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TaskTemplateSelector />
          <ExportDropdown />
          <Link href="/mcp/history">
            <Button variant="outline" className="bg-white/70 shadow-sm">
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Historial</span>
            </Button>
          </Link>
        </div>
        <ExportToSheetsDialog />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Ejecuciones
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-1">en la última sesión</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600/70">
              Tasa de Éxito
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">
              {successRate}%
            </span>
            {successRate >= 80 && (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.success} exitosos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600/70">
              Fallos
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-600">{stats.fail}</div>
          <p className="text-xs text-slate-500 mt-1">requieren atención</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600/70">
              Duración Prom.
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-blue-600">
              {(stats.avgDuration / 1000).toFixed(1)}
            </span>
            <span className="text-lg font-medium text-blue-400">s</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">por tarea</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-5 lg:p-6">
          <MCPExecutionList
            executions={recentExecutions}
            title="Última Actividad"
            limit={5}
          />
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/mcp/history"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Ver historial completo
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
