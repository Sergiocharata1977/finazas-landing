'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { BrainCircuit, Layout, ShieldCheck } from 'lucide-react';

const icons = [Layout, BrainCircuit, ShieldCheck];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section
      id="how-it-works"
      className="relative py-20 lg:py-28 bg-slate-50/50"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 text-balance">
            {t.howItWorks.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.howItWorks.features.slice(0, 3).map((feature, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="relative group h-full">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden lg:block absolute top-[40px] -right-4 w-8 h-px bg-slate-100" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
