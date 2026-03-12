'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ISO_CLASSIC_PROCESSES } from '@/types/isoClassicProcesses';

interface ProcessStepProps {
  selectedKeys: string[];
  onChange: (keys: string[]) => void;
}

export function ProcessStep({ selectedKeys, onChange }: ProcessStepProps) {
  const toggleKey = (key: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedKeys, key]);
      return;
    }
    onChange(selectedKeys.filter(current => current !== key));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Procesos ISO clasicos (15)</Label>
        <button
          type="button"
          className="text-sm text-emerald-700 hover:underline"
          onClick={() => onChange(ISO_CLASSIC_PROCESSES.map(item => item.key))}
        >
          Seleccionar todos
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ISO_CLASSIC_PROCESSES.map(process => {
          const checked = selectedKeys.includes(process.key);
          return (
            <label
              key={process.key}
              className="flex items-start gap-3 rounded-md border p-3 cursor-pointer"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={value =>
                  toggleKey(process.key, Boolean(value))
                }
              />
              <span className="text-sm">
                <span className="font-medium block">{process.name}</span>
                <span className="text-slate-500">
                  {process.isoClause.join(', ')}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
