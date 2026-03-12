'use client';

import { HeroCarousel } from '@/components/marketing/hero-carousel';
import { useLanguage } from '@/components/marketing/language-context';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#fdfbf7] pt-24 pb-20 lg:pt-32 lg:pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
              {t.hero.title}
            </h1>

            <p className="text-lg md:text-xl text-slate-700 leading-relaxed text-pretty max-w-2xl border-l-4 border-amber-400 pl-6 py-2">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection('demo')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg shadow-lg font-semibold rounded-none"
              >
                {t.hero.cta1}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full sm:w-auto px-8 py-6 text-lg border-slate-300 text-slate-700 bg-transparent hover:bg-slate-100 transition-all font-semibold rounded-none"
              >
                {t.hero.cta2}
              </Button>
            </div>

            {t.hero.trust && (
              <div className="grid sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                {t.hero.trust.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-base text-slate-700 font-medium bg-white/70 border border-slate-200 px-4 py-3 rounded-xl"
                  >
                    <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[650px]">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
