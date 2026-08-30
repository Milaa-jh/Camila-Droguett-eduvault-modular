import Link from 'next/link';
import { BookOpen, NotebookPen, Brain, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const benefits = [
  {
    icon: BookOpen,
    title: 'Organiza tus asignaturas',
    description: 'Estructura tu material por asignaturas y unidades, todo en un solo lugar.',
  },
  {
    icon: NotebookPen,
    title: 'Crea tus propios resúmenes',
    description: 'Escribe y consulta resúmenes de estudio asociados a cada unidad.',
  },
  {
    icon: Brain,
    title: 'Evalúa tus conocimientos',
    description: 'Crea tests de autoevaluación y revisa tu progreso académico.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <GraduationCap className="h-6 w-6 text-brand-600" />
          EduVault
        </div>
        <Link href="/login">
          <Button variant="secondary">Iniciar sesión</Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full bg-brand-50 px-4 py-1 text-sm font-medium text-brand-700">
            EduVault Modular
          </span>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Tu espacio inteligente para organizar, aprender y evaluar tus conocimientos.
          </h1>
          <p className="max-w-xl text-base text-slate-500">
            Centraliza tus asignaturas, unidades, material de estudio, resúmenes y tests de
            autoevaluación en una sola plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/register">
            <Button className="px-6 py-3 text-base">Comenzar ahora</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Iniciar sesión
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid w-full gap-6 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
            >
              <div className="rounded-xl bg-brand-50 p-2.5">
                <Icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        EduVault Modular — MVP académico
      </footer>
    </div>
  );
}
