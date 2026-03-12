'use client';

import { ISO_CLASSIC_PROCESSES } from '@/types/isoClassicProcesses';
import { CompanyData } from './CompanyStep';

interface SummaryStepProps {
  company: CompanyData;
  norm: 'iso_9001';
  selectedKeys: string[];
}

export function SummaryStep({ company, norm, selectedKeys }: SummaryStepProps) {
  const selected = ISO_CLASSIC_PROCESSES.filter(item =>
    selectedKeys.includes(item.key)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h3 className="font-semibold mb-2">Empresa</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>Nombre: {company.name || '-'}</li>
          <li>CUIT: {company.cuit || '-'}</li>
          <li>Rubro: {company.sector || '-'}</li>
          <li>Contacto: {company.contact || '-'}</li>
        </ul>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="font-semibold mb-2">Norma seleccionada</h3>
        <p className="text-sm text-slate-700">{norm.toUpperCase()}</p>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="font-semibold mb-2">Procesos a provisionar</h3>
        <p className="text-sm text-slate-500 mb-2">
          Total seleccionados: {selected.length}
        </p>
        <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
          {selected.map(item => (
            <li key={item.key}>{item.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
