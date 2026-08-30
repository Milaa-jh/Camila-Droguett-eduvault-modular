'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subjects', label: 'Mis asignaturas', icon: BookOpen },
  { href: '/tests', label: 'Tests', icon: ClipboardCheck },
  { href: '/progress', label: 'Mi progreso', icon: BarChart3 },
  { href: '/profile', label: 'Mi perfil', icon: UserCircle },
];

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-2 font-semibold text-slate-900">
        <GraduationCap className="h-5 w-5 text-brand-600" />
        EduVault
      </div>
      <button onClick={() => setOpen(true)} aria-label="Abrir menú">
        <Menu className="h-6 w-6 text-slate-700" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <GraduationCap className="h-5 w-5 text-brand-600" />
              EduVault
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X className="h-6 w-6 text-slate-700" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                    active ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
