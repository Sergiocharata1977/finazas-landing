// src/app/app-vendedor/whatsapp/page.tsx
// Lista de conversaciones WhatsApp para App Vendedor

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronRight,
  MessageSquare,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Conversation {
  id: string;
  cliente_nombre: string;
  phone: string;
  ultimo_mensaje: string;
  ultimo_mensaje_at: string;
  mensajes_no_leidos: number;
}

export default function VendedorWhatsAppPage() {
  const router = useRouter();
  const { user } = useAuth();
  const organizationId = user?.organization_id;
  const vendedorId = user?.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadConversations = useCallback(async () => {
    if (!organizationId || !vendedorId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        organization_id: organizationId,
        vendedor_id: vendedorId,
      });

      const res = await fetch(`/api/whatsapp/conversations?${params}`);
      const data = await res.json();

      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, vendedorId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter(
    conv =>
      conv.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.phone?.includes(searchTerm)
  );

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: es,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-lg font-semibold">WhatsApp</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-green-700"
            onClick={loadConversations}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-200" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 bg-green-700 border-green-600 text-white placeholder:text-green-200 focus-visible:ring-green-400"
          />
        </div>
      </header>

      {/* Conversations List */}
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
            <p>No hay conversaciones</p>
          </div>
        ) : (
          <div className="divide-y bg-white">
            {filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => router.push(`/app-vendedor/whatsapp/${conv.id}`)}
                className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    conv.mensajes_no_leidos > 0
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <User className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">
                      {conv.cliente_nombre || conv.phone}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conv.ultimo_mensaje_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {conv.ultimo_mensaje || 'Sin mensajes'}
                    </p>
                    {conv.mensajes_no_leidos > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {conv.mensajes_no_leidos}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
