'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingApprovalPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no hay usuario cargando, redirigir a login
    if (!loading && !user) {
      router.push('/login');
    }
    // Si el usuario ya está activo, redirigir al dashboard
    // Nota: Esto requeriría que el contexto de Auth se actualice o verificar el custom claim/firestore
    // Por ahora lo dejamos simple.
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Cuenta en Revisión
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Gracias por registrarte en <strong>Don Cándido IA</strong>. Tu
          solicitud ha sido recibida y está siendo procesada por nuestro equipo
          de administración.
          <br />
          <br />
          Recibirás una notificación cuando tu cuenta haya sido aprobada y tu{' '}
          <strong>Trial de 30 días</strong> esté activo.
        </p>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-8 text-left border border-slate-700">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">
                ¿Por qué debo esperar?
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Para garantizar la seguridad y el cumplimiento normativo ISO
                9001, verificamos manualmente cada solicitud de acceso.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
