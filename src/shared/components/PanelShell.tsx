'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

export type NavigationItem = {
  href: string;
  label: string;
  Icon: (props: { className?: string }) => ReactNode;
};

type PanelShellProps = {
  sectionLabel: string;
  title: string;
  subtitle?: string;
  navigation: NavigationItem[];
  currentPath: string;
  headerEnd: ReactNode;
  children: ReactNode;
};

export function PanelShell({
  sectionLabel,
  title,
  subtitle,
  navigation,
  currentPath,
  headerEnd,
  children,
}: PanelShellProps) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-border bg-surface-raised lg:flex">
        <div className="px-6 py-6">
          <BrandMark size="sm" compact className="text-content" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4">
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-widest text-content-muted uppercase">
            {sectionLabel}
          </p>

          {navigation.map(({ href, label, Icon }) => {
            const current = href === currentPath;

            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                  current
                    ? 'bg-brand text-on-brand'
                    : 'text-content-muted hover:bg-surface hover:text-content'
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur lg:px-8">
          <BrandMark size="sm" compact className="text-content lg:hidden" />

          <div className="hidden min-w-0 flex-col lg:flex">
            <p className="text-[0.6875rem] font-semibold tracking-widest text-content-muted uppercase">
              {sectionLabel}
            </p>
            <p className="truncate text-lg font-semibold tracking-tight">{title}</p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">{headerEnd}</div>
        </header>

        {/* On a narrow screen the rail is gone, so the theme control moves here. */}
        <div className="flex justify-end border-b border-border px-4 py-2 lg:hidden">
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-brand lg:text-3xl">
                {title}
              </h1>
              {subtitle && <p className="text-content-muted">{subtitle}</p>}
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
