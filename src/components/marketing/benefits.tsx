'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, FileStack, Route, UserCheck } from 'lucide-react';

const icons = [Route, FileStack, UserCheck, Bot];

export function Benefits() {
  const { t } = useLanguage();

  return (
    <section
      id="benefits"
      className="relative py-20 lg:py-28 bg-white overflow-hidden border-t border-slate-100"
    >
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t.benefits.title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
            {t.benefits.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.benefits.items.map((item, index) => {
            const Icon = icons[index] || Bot;
            return (
              <Card
                key={index}
                className="border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-6 shadow-sm transition-all group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
