'use client';

import { useLanguage } from '@/components/marketing/language-context';
import { Check } from 'lucide-react';

export function ProposalSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t.proposal.title}
            <span className="block text-slate-500 mt-2">
              {t.proposal.subtitle}
            </span>
          </h2>
          <p className="text-lg text-slate-600 mt-6">
            {t.proposal.explanation}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.proposal.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-200 rounded-none shadow-sm hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-slate-800 font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
