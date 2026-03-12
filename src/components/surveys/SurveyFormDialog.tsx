'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SurveyFormData, SurveyType } from '@/types/surveys';
import { SURVEY_TYPE_LABELS } from '@/types/surveys';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface SurveyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SurveyFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: SurveyFormDialogProps) {
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    type: 'anual',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('El título es requerido');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear encuesta');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ title: '', type: 'anual' });
    } catch (error) {
      console.error('Error creating survey:', error);
      alert(
        error instanceof Error ? error.message : 'Error al crear la encuesta'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Encuesta de Satisfacción</DialogTitle>
          <DialogDescription>
            Crea una nueva encuesta para recopilar feedback de clientes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la Encuesta</Label>
            <Input
              id="title"
              placeholder="Ej: Encuesta de Satisfacción Q4 2025"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Encuesta</Label>
            <Select
              value={formData.type}
              onValueChange={(value: SurveyType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SURVEY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {formData.type === 'anual'
                ? 'Encuesta general enviada anualmente a todos los clientes'
                : 'Encuesta enviada después de cada entrega de producto/servicio'}
            </p>
          </div>

          {formData.type === 'post_entrega' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número de Pedido (Opcional)</Label>
                <Input
                  id="orderNumber"
                  placeholder="Ej: PED-2025-001"
                  value={formData.relatedOrderNumber || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      relatedOrderNumber: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Encuesta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
