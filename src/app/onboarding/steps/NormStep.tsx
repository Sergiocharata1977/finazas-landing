'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface NormStepProps {
  value: 'iso_9001';
  onChange: (next: 'iso_9001') => void;
}

export function NormStep({ value, onChange }: NormStepProps) {
  return (
    <div className="space-y-4">
      <Label>Norma a implementar</Label>
      <RadioGroup value={value} onValueChange={v => onChange(v as 'iso_9001')}>
        <div className="flex items-center space-x-2 rounded-md border p-3">
          <RadioGroupItem value="iso_9001" id="norm_iso_9001" />
          <Label htmlFor="norm_iso_9001">ISO 9001:2015</Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-slate-500">
        En esta version, el onboarding automatico provisiona templates ISO 9001.
      </p>
    </div>
  );
}
