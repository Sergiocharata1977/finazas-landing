'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CompanyData {
  name: string;
  cuit: string;
  sector: string;
  contact: string;
}

interface CompanyStepProps {
  value: CompanyData;
  onChange: (next: CompanyData) => void;
}

export function CompanyStep({ value, onChange }: CompanyStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company_name">Nombre de empresa *</Label>
        <Input
          id="company_name"
          value={value.name}
          onChange={e => onChange({ ...value, name: e.target.value })}
          placeholder="Concesionario Ejemplo SA"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_cuit">CUIT</Label>
          <Input
            id="company_cuit"
            value={value.cuit}
            onChange={e => onChange({ ...value, cuit: e.target.value })}
            placeholder="30-12345678-9"
          />
        </div>

        <div>
          <Label htmlFor="company_contact">Contacto</Label>
          <Input
            id="company_contact"
            value={value.contact}
            onChange={e => onChange({ ...value, contact: e.target.value })}
            placeholder="gerencia@empresa.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="company_sector">Rubro</Label>
        <Input
          id="company_sector"
          value={value.sector}
          onChange={e => onChange({ ...value, sector: e.target.value })}
          placeholder="Concesionario agricola / vial"
        />
      </div>
    </div>
  );
}
