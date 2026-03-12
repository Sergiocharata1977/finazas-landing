'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signIn } from '@/firebase/auth';
import { resolvePostLoginDestination } from '@/lib/auth/postLoginRouting';
import {
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Get optional return URL from query params
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    if (!authLoading && user) {
      router.push(resolvePostLoginDestination(user, returnUrl));
    }
  }, [user, authLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (result.success) {
      let landingDestination = resolvePostLoginDestination(null, returnUrl);

      // MULTI-TENANT: Obtener organization_id y verificar STATUS
      try {
        const userResponse = await fetch(`/api/users/${result.user?.uid}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const organizationId = userData.organization_id;

          // 1. Verificar Estado
          if (userData.status === 'pending_approval') {
            // Forzar logout si no debería entrar, o bloquear acceso.
            // Como signIn ya ocurrió en Firebase, aquí decidimos si lo dejamos pasar o no.
            // Para seguridad real, esto también debería chequearse en middleware/reglas.
            // Pero a nivel UI de login:
            if (userData.rol !== 'super_admin') {
              // Super admin siempre pasa
              // Podríamos hacer signOut aquí si queremos ser estrictos
              // await signOut();
              router.push('/pending');
              return;
            }
          }

          if (userData.status === 'expired') {
            if (userData.rol !== 'super_admin') {
              router.push('/dashboard/subscription'); // Crear esta página
              return;
            }
          }

          // Verificar expiración por fecha (doble check)
          if (userData.expirationDate && userData.rol !== 'super_admin') {
            const expDate = new Date(userData.expirationDate);
            if (expDate < new Date()) {
              // Expirado
              // Actualizar estado en DB si es necesario (idealmente vía cloud function, aquí solo UI)
              router.push('/dashboard/subscription');
              return;
            }
          }
          // Super admins should NOT have an organization_id in sessionStorage
          if (userData.rol === 'super_admin') {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('organization_id');
            }
          } else if (organizationId) {
            console.log(
              '[Login] Usuario pertenece a organización:',
              organizationId
            );
            // Guardar organization_id en sessionStorage para uso en toda la app
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('organization_id', organizationId);
            }
          } else {
            console.warn('[Login] Usuario sin organization_id asignado');
          }

          landingDestination = resolvePostLoginDestination(userData, returnUrl);
        }
      } catch (error) {
        console.error('[Login] Error al obtener datos de usuario:', error);
      }
      router.push(landingDestination);
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f4] relative overflow-hidden flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_40%)]" />
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-14 m-6 rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Don Cándido IA
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl xl:text-5xl font-bold text-slate-950 mb-6 leading-tight">
            Gestión de Calidad
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Potenciada por IA
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-12 leading-relaxed">
            Automatiza auditorías, gestiona hallazgos y optimiza tus procesos
            ISO 9001 con la ayuda de inteligencia artificial avanzada.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  Asistente de IA 24/7
                </h3>
                <p className="text-slate-500 text-sm">
                  Gestión de Hallazgos Automatizada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  Dashboard en Tiempo Real
                </h3>
                <p className="text-slate-500 text-sm">
                  Monitorea KPIs y tendencias automáticamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold mb-1">
                  Trazabilidad Total
                </h3>
                <p className="text-slate-500 text-sm">
                  Cumplimiento completo de ISO 9001:2015
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Don Cándido IA
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Bienvenido de nuevo
              </h2>
              <p className="text-slate-600">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 pr-12 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                ¿No tienes cuenta?{' '}
                <Link
                  href="/register"
                  className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-500 text-sm mt-8">
            © {new Date().getFullYear()} Don Cándido IA. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f4]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
