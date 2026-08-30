import Link from 'next/link';
import { GraduationCap, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <GraduationCap className="h-10 w-10 text-brand-600" />
      <h1 className="text-5xl font-bold text-slate-900">404</h1>
      <p className="max-w-sm text-slate-500">
        No pudimos encontrar la página que buscas. Puede que se haya movido o que la ruta esté
        mal escrita.
      </p>
      <Link href="/dashboard">
        <Button className="mt-2 gap-1.5">
          <Home className="h-4 w-4" /> Volver al Dashboard
        </Button>
      </Link>
    </div>
  );
}
