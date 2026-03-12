'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Building2,
  CheckCircle2,
  Copy,
  Loader2,
  MessageSquare,
  Phone,
  Rocket,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  whatsapp: string;
  employees: string;
  hasISO: boolean;
  message: string;
  status: 'pending' | 'contacted' | 'closed' | 'activated';
  created_at: any;
  spamScore?: number;
  spamReasons?: string[];
  isLikelySpam?: boolean;
}

interface ActivationCredentials {
  requestId: string;
  name: string;
  email: string;
  password: string;
  trialDays: number;
  loginUrl: string;
  whatsapp: string;
}

function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingSpam, setRemovingSpam] = useState(false);
  const [latestCredentials, setLatestCredentials] =
    useState<ActivationCredentials | null>(null);
  const [meta, setMeta] = useState<{ total: number; spamCount: number }>({
    total: 0,
    spamCount: 0,
  });

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout | null = null;

    const loadRequests = async () => {
      try {
        setError(null);
        const response = await fetch('/api/super-admin/demo-requests', {
          cache: 'no-store',
        });
        const json = await response.json();

        if (!mounted) return;

        if (response.ok && json.success) {
          setRequests(json.data || []);
          setMeta({
            total: json?.meta?.total || (json.data || []).length,
            spamCount:
              json?.meta?.spamCount ||
              (json.data || []).filter((r: DemoRequest) => r.isLikelySpam)
                .length,
          });
        } else {
          setError(
            json?.error ||
              json?.message ||
              'No se pudieron cargar las solicitudes.'
          );
        }
      } catch (error) {
        console.error('Error cargando demo requests:', error);
        if (mounted) {
          setError('Error de red al cargar solicitudes.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRequests();
    timer = setInterval(loadRequests, 15000);

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  const updateStatus = async (
    id: string,
    status: 'pending' | 'contacted' | 'closed'
  ) => {
    const response = await fetch(
      `/api/super-admin/demo-requests/${id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(`Error actualizando estado: ${data.error || 'desconocido'}`);
      return;
    }

    setRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const buildAccessMessage = (credentials: ActivationCredentials) => {
    return `Hola ${credentials.name}, tu cuenta en Don Candido IA ya esta activa.

Usuario: ${credentials.email}
Password temporal: ${credentials.password}
Ingreso: ${credentials.loginUrl}
Prueba: ${credentials.trialDays} dias`;
  };

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(successMessage);
    } catch (copyError) {
      console.error('Error copiando al portapapeles:', copyError);
      alert('No se pudo copiar al portapapeles.');
    }
  };

  const activateAndContact = async (request: DemoRequest) => {
    setActivatingId(request.id);

    try {
      const response = await fetch('/api/demo-requests/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoRequestId: request.id,
          name: request.name,
          email: request.email,
          company: request.company,
          whatsapp: request.whatsapp,
          trialDays: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      const credentials: ActivationCredentials = {
        requestId: request.id,
        name: request.name,
        email: data.email,
        password: data.password,
        trialDays: data.trialDays,
        loginUrl: data.loginUrl || 'https://doncandidoia.com/login',
        whatsapp: request.whatsapp,
      };

      setLatestCredentials(credentials);
      setRequests(prev =>
        prev.map(item =>
          item.id === request.id ? { ...item, status: 'activated' } : item
        )
      );

      const whatsappNumber = request.whatsapp.replace(/[^0-9]/g, '');
      if (whatsappNumber) {
        const message = buildAccessMessage(credentials);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error('Error activando usuario:', error);
      alert('Error al activar el usuario');
    } finally {
      setActivatingId(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const contactedRequests = requests.filter(r => r.status === 'contacted');
  const activatedRequests = requests.filter(r => r.status === 'activated');
  const closedRequests = requests.filter(r => r.status === 'closed');
  const spamRequests = requests.filter(r => r.isLikelySpam);

  const deleteSpam = async () => {
    if (spamRequests.length === 0) {
      alert('No hay solicitudes spam detectadas.');
      return;
    }

    const confirmed = window.confirm(
      `Se eliminaran ${spamRequests.length} solicitudes marcadas como spam. Continuar?`
    );
    if (!confirmed) return;

    setRemovingSpam(true);
    try {
      const response = await fetch('/api/super-admin/demo-requests', {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        alert(`Error eliminando spam: ${json?.error || 'desconocido'}`);
        return;
      }

      setRequests(prev => prev.filter(r => !r.isLikelySpam));
      setMeta(prev => ({
        ...prev,
        spamCount: 0,
        total: Math.max(0, prev.total - (json.deleted || 0)),
      }));
      alert(`Se eliminaron ${json.deleted || 0} solicitudes spam.`);
    } catch (err) {
      console.error('Error deleting spam:', err);
      alert('Error de red eliminando spam.');
    } finally {
      setRemovingSpam(false);
    }
  };

  const RequestCard = ({ request }: { request: DemoRequest }) => (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{request.name}</h3>
            <p className="text-sm text-slate-400">{request.email}</p>
          </div>
          <div className="flex gap-2">
            {request.hasISO && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                ISO 9001
              </Badge>
            )}
            {request.isLikelySpam && (
              <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
                Spam score {request.spamScore || 0}
              </Badge>
            )}
            {request.status === 'activated' && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                Activado
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">{request.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">
              {request.employees} empleados
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            <a
              href={`https://wa.me/${request.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {request.whatsapp}
            </a>
          </div>
        </div>

        {request.message && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" />
              <p className="text-sm text-slate-300">{request.message}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {(() => {
            const createdAt = normalizeDate(request.created_at);
            return (
              <span className="text-xs text-slate-500">
                {createdAt &&
                  formatDistanceToNow(createdAt, {
                    addSuffix: true,
                    locale: es,
                  })}
              </span>
            );
          })()}
          <div className="flex gap-2">
            {request.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => activateAndContact(request)}
                  disabled={activatingId === request.id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {activatingId === request.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-1" />
                  )}
                  Activar y Contactar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(request.id, 'contacted')}
                  className="border-slate-700 text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Solo Contactado
                </Button>
              </>
            )}
            {request.status === 'contacted' && (
              <>
                <Button
                  size="sm"
                  onClick={() => activateAndContact(request)}
                  disabled={activatingId === request.id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {activatingId === request.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-1" />
                  )}
                  Activar Ahora
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(request.id, 'closed')}
                  className="border-slate-700"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cerrar
                </Button>
              </>
            )}
            {request.status === 'closed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(request.id, 'pending')}
                className="border-slate-700 text-slate-300"
              >
                Reabrir
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Solicitudes de Demo
        </h2>
        <p className="text-slate-400">
          Gestiona las solicitudes recibidas desde la landing page.
        </p>
      </div>

      {latestCredentials && (
        <Card className="border-emerald-700/40 bg-emerald-950/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-emerald-300">
                  Credenciales generadas
                </h3>
                <p className="text-xs text-emerald-200/80">
                  Puedes compartirlas por WhatsApp, llamada o cualquier otro
                  canal sin depender del email.
                </p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                Solicitud: {latestCredentials.requestId}
              </Badge>
            </div>
            <div className="rounded-md border border-emerald-800/50 bg-slate-900/60 p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap">
              {`Usuario: ${latestCredentials.email}
Password temporal: ${latestCredentials.password}
Ingreso: ${latestCredentials.loginUrl}
Prueba: ${latestCredentials.trialDays} dias`}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-600 text-emerald-100"
                onClick={() =>
                  copyText(
                    buildAccessMessage(latestCredentials),
                    'Credenciales copiadas.'
                  )
                }
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar acceso
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 text-slate-200"
                onClick={() =>
                  copyText(
                    latestCredentials.password,
                    'Password copiada al portapapeles.'
                  )
                }
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar password
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  const whatsappNumber = latestCredentials.whatsapp.replace(
                    /[^0-9]/g,
                    ''
                  );
                  if (!whatsappNumber) {
                    alert('La solicitud no tiene WhatsApp valido.');
                    return;
                  }
                  const message = buildAccessMessage(latestCredentials);
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <Phone className="w-4 h-4 mr-1" />
                Enviar por WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-slate-700 text-slate-100">
          Total: {meta.total}
        </Badge>
        <Badge className="bg-red-500/20 text-red-300 border border-red-400/30">
          Spam detectado: {meta.spamCount}
        </Badge>
        <Button
          size="sm"
          variant="destructive"
          onClick={deleteSpam}
          disabled={removingSpam || spamRequests.length === 0}
        >
          {removingSpam ? 'Eliminando spam...' : 'Eliminar spam detectado'}
        </Button>
      </div>
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-400">Cargando solicitudes...</div>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
          >
            Pendientes{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {pendingRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="contacted"
            className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
          >
            Contactados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {contactedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="activated"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500"
          >
            Activados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {activatedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-400"
          >
            Cerrados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {closedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="spam"
            className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400"
          >
            Spam{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {spamRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {pendingRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes pendientes.
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4 mt-6">
          {contactedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {contactedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes contactadas.
            </div>
          )}
        </TabsContent>

        <TabsContent value="activated" className="space-y-4 mt-6">
          {activatedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {activatedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay usuarios activados.
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4 mt-6">
          {closedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {closedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes cerradas.
            </div>
          )}
        </TabsContent>

        <TabsContent value="spam" className="space-y-4 mt-6">
          {spamRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {spamRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes catalogadas como spam.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
