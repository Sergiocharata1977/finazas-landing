// src/app/app-vendedor/whatsapp/[conversationId]/page.tsx
// Chat individual de WhatsApp para App Vendedor

'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MoreVertical,
  Send,
  User,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  status?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  cliente_nombre: string;
  phone: string;
}

export default function VendedorChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { user } = useAuth();
  const organizationId = user?.organization_id;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation and messages
  const loadData = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);

      // Load messages
      const res = await fetch(
        `/api/whatsapp/messages/${conversationId}?limit=100`
      );
      const data = await res.json();

      if (data.success) {
        setMessages((data.data || []).reverse());
        // Extract conversation info from first message or use placeholder
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || sending || !conversation) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: organizationId,
          conversation_id: conversationId,
          to: conversation.phone,
          body: messageText,
          sender_user_id: user?.id,
          sender_name: user?.email?.split('@')[0] || 'Vendedor',
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Add message locally
        const newMsg: Message = {
          id: data.data.message_id,
          direction: 'OUTBOUND',
          body: messageText,
          status: 'sent',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMsg]);
      } else {
        toast.error(data.error || 'Error enviando mensaje');
        setNewMessage(messageText); // Restore message
      }
    } catch (error) {
      console.error('Error sending:', error);
      toast.error('Error de conexión');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: es });
  };

  const renderStatus = (status?: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      default:
        return <Check className="h-3 w-3 opacity-50" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      {/* Header */}
      <header className="bg-green-600 text-white px-2 py-2 flex items-center gap-2 sticky top-0 z-10 shadow">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">
            {conversation?.cliente_nombre || 'Chat'}
          </h1>
          <p className="text-xs text-green-100 truncate">
            {conversation?.phone || ''}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-green-700"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      {/* Messages */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 shadow-sm',
                  msg.direction === 'OUTBOUND'
                    ? 'bg-[#dcf8c6] rounded-tr-none'
                    : 'bg-white rounded-tl-none'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.body}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">
                    {formatTime(msg.created_at)}
                  </span>
                  {msg.direction === 'OUTBOUND' && renderStatus(msg.status)}
                </div>
              </div>
            </div>
          ))
        )}

        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            <p>No hay mensajes aún</p>
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="bg-[#f0f0f0] px-2 py-2 flex gap-2 items-end">
        <Textarea
          placeholder="Mensaje"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 min-h-[44px] max-h-24 resize-none bg-white rounded-full px-4"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          size="icon"
          className="bg-green-500 hover:bg-green-600 rounded-full h-11 w-11"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </footer>
    </div>
  );
}
