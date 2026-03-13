import Link from 'next/link';

// ─────────────────────────────────────────────
// Don Cándido Finanzas — Landing Page
// Préstamos personales · Multi-tenant
// ─────────────────────────────────────────────

const features = [
  {
    icon: '📋',
    title: 'Plan de cuotas automático',
    desc: 'Sistema francés con cálculo de capital, interés y amortización en cada cuota. Configurá tasa, plazo y mora desde el panel.',
  },
  {
    icon: '🏢',
    title: 'Multi-tenant real',
    desc: 'Cada empresa financiera, cooperativa o mutual tiene su propio ambiente aislado: clientes, cartera y configuración independiente.',
  },
  {
    icon: '💸',
    title: 'Cobranzas y mora',
    desc: 'Registrá pagos parciales o totales. La plataforma calcula mora automáticamente y actualiza el saldo de cada préstamo.',
  },
  {
    icon: '📒',
    title: 'Contabilidad automática',
    desc: 'Cada préstamo, cuota cobrada y asiento de mora genera doble partida contable automáticamente. Sin carga manual.',
  },
  {
    icon: '👤',
    title: 'Portal del cliente',
    desc: 'El deudor puede ver su plan de cuotas, saldo pendiente e historial de pagos desde cualquier dispositivo.',
  },
  {
    icon: '📊',
    title: 'Cartera e informes',
    desc: 'Dashboard con cartera vigente, vencida y en mora. Exportá a Excel para tu contador o auditor.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Configurá tu empresa',
    desc: 'Cargá los parámetros de tu financiera: tasas, plazos máximos, política de mora y datos fiscales.',
  },
  {
    n: '02',
    title: 'Cargá un préstamo',
    desc: 'Ingresá monto, plazo y tasa. El sistema genera el plan de cuotas francés al instante y lo asocia al cliente.',
  },
  {
    n: '03',
    title: 'Cobrá y contabilizá',
    desc: 'Al registrar un pago, la plataforma actualiza saldo, aplica mora si corresponde y genera el asiento contable.',
  },
];

const targets = [
  { icon: '🏦', label: 'Financieras' },
  { icon: '🤝', label: 'Cooperativas' },
  { icon: '🏛️', label: 'Mutuales' },
  { icon: '🏪', label: 'Comercios con crédito propio' },
  { icon: '🌾', label: 'Financieras agropecuarias' },
  { icon: '💼', label: 'Prestamistas formales' },
];

const faqs = [
  {
    q: '¿Es realmente multi-tenant?',
    a: 'Sí. Cada organización tiene su base de datos lógicamente aislada. Los datos de una empresa nunca son visibles para otra.',
  },
  {
    q: '¿Qué tipos de préstamos soporta?',
    a: 'Préstamos personales, ventas financiadas y créditos de consumo. El motor usa sistema francés con amortización automática.',
  },
  {
    q: '¿Incluye portal para el cliente?',
    a: 'Sí. Cada cliente puede acceder a un portal donde ve sus cuotas pendientes, saldo y comprobantes de pago.',
  },
  {
    q: '¿Se integra con mi contabilidad?',
    a: 'Genera asientos contables por doble partida automáticamente en cada operación. Próximamente exportación a sistemas contables.',
  },
  {
    q: '¿Cuánto tarda en configurarse?',
    a: 'Una empresa puede estar operativa en menos de 30 minutos: registro, configuración de parámetros y primer préstamo.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DC</span>
            </div>
            <span className="font-bold text-white">Don Cándido <span className="text-emerald-400">Finanzas</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Características</a>
            <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">Cómo funciona</a>
            <a href="#para-quien" className="hover:text-emerald-400 transition-colors">Para quién</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-sm text-emerald-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Plataforma multi-tenant para préstamos personales
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Gestioná tu Cartera de{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Préstamos Personales
            </span>{' '}
            sin complicaciones
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Don Cándido Finanzas automatiza cuotas, cobranzas y contabilidad
            para financieras, cooperativas y mutuales. Multi-tenant desde el primer día.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-colors shadow-lg shadow-emerald-900/30"
            >
              Comenzar gratis →
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto px-8 py-3 rounded-full border border-slate-700 hover:border-emerald-600 text-slate-300 hover:text-white font-medium text-lg transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { n: 'Multi-tenant', l: 'Ambientes aislados por empresa' },
              { n: 'Sistema Francés', l: 'Cuotas con amortización real' },
              { n: 'Contabilidad', l: 'Asientos automáticos' },
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="text-lg font-bold text-emerald-400">{s.n}</div>
                <div className="text-xs text-slate-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesita tu financiera
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Desde el alta de un préstamo hasta el cierre contable, sin apps externas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-800 transition-colors"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tres pasos para operar
            </h2>
            <p className="text-slate-400">
              Sin instalaciones, sin configuraciones complicadas.
            </p>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-[2.25rem] top-12 bottom-12 w-px bg-slate-800" />
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center text-emerald-400 font-bold text-sm z-10">
                    {s.n}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-white text-lg mb-1">{s.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section id="para-quien" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Para quién es Don Cándido Finanzas?
          </h2>
          <p className="text-slate-400 mb-12 max-w-xl mx-auto">
            Cualquier organización que otorgue créditos personales puede operar con nuestra plataforma.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {targets.map(t => (
              <div
                key={t.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-sm font-medium text-slate-200">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="font-semibold text-white mb-2">{f.q}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-cyan-900/20 border border-emerald-800/40">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comenzá hoy sin costo
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Registrá tu empresa, configurá tus parámetros y tenés tu primer préstamo cargado en menos de 30 minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg transition-colors"
              >
                Crear cuenta gratis
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3 rounded-full border border-slate-600 hover:border-emerald-600 text-slate-300 hover:text-white font-medium text-lg transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">DC</span>
            </div>
            <span>Don Cándido Finanzas</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Acceder</Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">Registrarse</Link>
          </div>
          <span>© {new Date().getFullYear()} Don Cándido IA. Todos los derechos reservados.</span>
        </div>
      </footer>

    </div>
  );
}
