'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción, aquí se podría enviar el error a un servicio de monitoreo.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900">Ocurrió un error inesperado</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Algo salió mal al cargar esta página. Puedes intentar nuevamente o volver más tarde.
      </p>
      <Button onClick={reset} className="mt-2 gap-1.5">
        <RotateCcw className="h-4 w-4" /> Intentar de nuevo
      </Button>
    </div>
  );
}
