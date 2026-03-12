'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Lock, ScanEye, ShieldCheck } from 'lucide-react';

const featureIcons = [Lock, ScanEye, ShieldCheck];

export function ArchitectureSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
            <ShieldCheck className="w-8 h-8 text-slate-800" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t.architecture.title}
          </h2>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-500 mb-6">
            {t.architecture.subtitle}
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto text-pretty">
            {t.architecture.description}
          </p>
        </div>

        {/* Feature Cards */}
        {t.architecture.features && (
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {t.architecture.features.map((feature, index) => {
              const Icon = featureIcons[index] || ShieldCheck;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
