'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 shadow-lg shadow-slate-900/20">
              <span className="font-mono text-xl font-bold text-white">DC</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Don Candido IA
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Ir a seccion Como funciona"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Ir a seccion Beneficios"
            >
              {t.nav.benefits}
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              aria-label="Ir a seccion Contacto"
            >
              {t.nav.contact}
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <Select
              value={language}
              onValueChange={val => setLanguage(val as 'en' | 'es' | 'pt')}
            >
              <SelectTrigger className="h-10 w-32 border-slate-200 bg-slate-50 text-sm text-slate-600 transition-colors hover:bg-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white shadow-2xl">
                <SelectItem
                  value="es"
                  className="cursor-pointer text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                >
                  ES - Espanol
                </SelectItem>
                <SelectItem
                  value="en"
                  className="cursor-pointer text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                >
                  EN - English
                </SelectItem>
                <SelectItem
                  value="pt"
                  className="cursor-pointer text-slate-700 hover:bg-slate-50 focus:bg-slate-50"
                >
                  PT - Portugues
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => scrollToSection('demo')}
              className="hidden bg-slate-900 px-6 font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 sm:inline-flex"
            >
              {t.hero.cta1}
            </Button>

            <button
              className="p-2 text-slate-600 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white py-6 md:hidden">
            <nav className="flex flex-col gap-5 text-center">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {t.nav.howItWorks}
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {t.nav.benefits}
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {t.nav.contact}
              </button>
              <Button
                onClick={() => scrollToSection('demo')}
                className="w-full bg-slate-900 py-6 text-base font-semibold text-white"
              >
                {t.hero.cta1}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
