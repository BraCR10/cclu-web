'use client';

import type { ReactNode } from 'react';
import { BrandMark } from '@/shared/components/BrandMark';
import { InboxIcon, SignOutIcon } from '@/shared/components/icons';

type AdminShellProps = {
  title: string;
  subtitle?: string;
  onSignOut: () => void;
  children: ReactNode;
};

function SignOutButton({
  onSignOut,
  className = '',
}: {
  onSignOut: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSignOut}
      className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-content-muted transition-colors hover:bg-surface hover:text-content ${className}`}
    >
      <SignOutIcon />
      Cerrar sesión
    </button>
  );
}

export function AdminShell({ title, subtitle, onSignOut, children }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-border bg-surface-raised lg:flex">
        <div className="px-6 py-6">
          <BrandMark size="sm" compact className="text-content" />
        </div>

        <nav className="flex-1 px-4">
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-widest text-content-muted uppercase">
            Gestión
          </p>

          <span
            aria-current="page"
            className="flex items-center gap-3 rounded-control bg-brand px-3 py-2.5 text-sm font-medium text-on-brand"
          >
            <InboxIcon />
            Solicitudes
          </span>
        </nav>

        <div className="border-t border-border p-4">
          <SignOutButton onSignOut={onSignOut} className="w-full" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-surface/85 px-6 py-4 backdrop-blur lg:px-8">
          <BrandMark size="sm" compact className="text-content lg:hidden" />

          <div className="hidden min-w-0 flex-col lg:flex">
            <p className="text-[0.6875rem] font-semibold tracking-widest text-content-muted uppercase">
              Panel administrativo
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          </div>

          <SignOutButton onSignOut={onSignOut} className="lg:hidden" />
        </header>

        <main className="flex-1 px-6 py-8 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-2 lg:hidden">
              <h2 className="text-2xl font-semibold tracking-tight text-brand">{title}</h2>
              {subtitle && <p className="text-sm text-content-muted">{subtitle}</p>}
            </div>

            {subtitle && <p className="hidden text-content-muted lg:block">{subtitle}</p>}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
