'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, CheckCircle, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Confetti from 'react-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#10B981', '#059669', '#34D399', '#6EE7B7', '#FBBF24']}
        />
      )}

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Image
            src="/logo-icono.png"
            alt="9001App"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="font-bold text-lg">9001App</h1>
            <p className="text-xs text-muted-foreground">Sistema ISO 9001</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              ¡Pago Exitoso!
              <PartyPopper className="w-7 h-7 text-yellow-500" />
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Tu suscripción ha sido activada correctamente
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Activo
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold">Premium</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Próxima facturación:
                </span>
                <span className="font-medium">
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('es-AR')}
                </span>
              </div>
              {userId && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">
                    ID de transacción:
                  </span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {userId.slice(0, 8)}...
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full h-12 text-base" size="lg">
                <Link href="/dashboard">
                  Comenzar a usar 9001App
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Recibirás un email de confirmación con los detalles de tu
                suscripción.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 9001App - Sistema de Gestión de Calidad ISO 9001:2015</p>
        </div>
      </footer>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
