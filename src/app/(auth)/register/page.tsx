'use client';

import { MODULE_ACCESS_OPTIONS } from '@/config/navigation';
import { signUp } from '@/firebase/auth';
import { UserService } from '@/services/auth/UserService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function RegisterPage() {
  const registerModules = useMemo(
    () => MODULE_ACCESS_OPTIONS.filter(modulo => modulo.selfRegister),
    []
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allModulesEnabled, setAllModulesEnabled] = useState(true);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(registerModules.map(modulo => modulo.id))
  );
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggleAllModules = () => {
    if (allModulesEnabled) {
      setAllModulesEnabled(false);
      setSelectedModules(new Set());
      return;
    }

    setAllModulesEnabled(true);
    setSelectedModules(new Set(registerModules.map(modulo => modulo.id)));
  };

  const handleToggleModule = (moduleId: string) => {
    const nextModules = new Set(selectedModules);
    if (nextModules.has(moduleId)) {
      nextModules.delete(moduleId);
    } else {
      nextModules.add(moduleId);
    }

    setSelectedModules(nextModules);
    setAllModulesEnabled(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contrase�as no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contrase�a debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!allModulesEnabled && selectedModules.size === 0) {
      setError(
        'Selecciona al menos un modulo o activa acceso completo para continuar'
      );
      setLoading(false);
      return;
    }

    const result = await signUp(formData.email, formData.password);

    if (result.success && result.user) {
      try {
        const modulosSeleccionados = allModulesEnabled
          ? null
          : Array.from(selectedModules);

        await UserService.createUser({
          uid: result.user.uid,
          email: result.user.email!,
          modulos_habilitados: modulosSeleccionados,
        });

        router.push('/pending');
      } catch (firestoreError: unknown) {
        console.error('Error creating user in Firestore:', firestoreError);
        setError(
          'Cuenta creada pero hubo un error al configurar tu perfil. Por favor contacta al administrador.'
        );
        setLoading(false);
      }
    } else {
      setError(result.error || 'Error al crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f4] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.08),transparent_40%)]" />
      <div className="max-w-xl w-full space-y-8 relative z-10">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] p-8 sm:p-10">
          <div>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Don Candido IA
            </p>
            <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Sistema de Gestion ISO 9001
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Contrase�a
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  placeholder="Minimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirmar Contrase�a
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white"
                  placeholder="Repite tu contrase�a"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Modulos
                    </p>
                    <p className="text-xs text-slate-500">
                      Selecciona los modulos para tu menu inicial
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allModulesEnabled}
                      onChange={handleToggleAllModules}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-600">
                  {allModulesEnabled
                    ? 'Acceso completo habilitado'
                    : `${selectedModules.size} modulo(s) seleccionados`}
                </p>

                <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                  {registerModules.map(modulo => (
                    <label
                      key={modulo.id}
                      className={`flex items-start gap-2 p-2 rounded border ${
                        selectedModules.has(modulo.id)
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 bg-white'
                      } ${allModulesEnabled ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.has(modulo.id)}
                        onChange={() => handleToggleModule(modulo.id)}
                        disabled={allModulesEnabled}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-900">
                          {modulo.nombre}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {modulo.descripcion}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                �Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Inicia sesi�n aqu�
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
