// src/app/crm/whatsapp/page.tsx
// Página de WhatsApp en CRM

'use client';

import { WhatsAppPanel } from '@/components/crm/whatsapp';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CRMWhatsAppPage() {
  const router = useRouter();
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">WhatsApp CRM</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus conversaciones con clientes
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* WhatsApp Panel */}
      <div className="flex-1 p-4">
        {organizationId ? (
          <WhatsAppPanel className="h-full" />
        ) : (
          <div className="h-full rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground">
            No hay organizacion activa para cargar conversaciones.
          </div>
        )}
      </div>
    </div>
  );
}
