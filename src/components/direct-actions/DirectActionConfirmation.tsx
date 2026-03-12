'use client';

import React, { useState } from 'react';
import { DirectActionConfirmation as DirectActionConfirmationType } from '@/types/direct-actions';
import { AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';

interface DirectActionConfirmationProps {
  confirmation: DirectActionConfirmationType;
  onConfirm: (actionId: string) => Promise<void>;
  onCancel: (actionId: string) => Promise<void>;
}

export const DirectActionConfirmation: React.FC<
  DirectActionConfirmationProps
> = ({ confirmation, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(confirmation.actionId);
      setResult('confirmed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onCancel(confirmation.actionId);
      setResult('cancelled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  if (result === 'confirmed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900">Acción Confirmada</h3>
          <p className="text-sm text-green-700 mt-1">{confirmation.summary}</p>
          {confirmation.result && (
            <p className="text-sm text-green-700 mt-2">
              {confirmation.result.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (result === 'cancelled') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
        <XCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">Acción Cancelada</h3>
          <p className="text-sm text-gray-700 mt-1">{confirmation.summary}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900">
            Confirmación Requerida
          </h3>
          <p className="text-sm text-yellow-700 mt-1">{confirmation.summary}</p>

          {error && (
            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirmar
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </button>
          </div>

          <p className="text-xs text-yellow-600 mt-3">
            ID de Acción:{' '}
            <code className="bg-yellow-100 px-2 py-1 rounded">
              {confirmation.actionId}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};
