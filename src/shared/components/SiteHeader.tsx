'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BrandMark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';
import { Dropdown } from './Dropdown';
import { ChevronDownIcon, CloseIcon, MenuIcon, UserIcon } from './icons';
import {
  HOME_SECTION,
  JOIN_ENTRY,
  SIGN_IN_ENTRIES,
  SITE_SECTIONS,
} from '@/shared/config/siteNavigation';

const NAVIGATION = [HOME_SECTION, ...SITE_SECTIONS];

function isCurrent(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function NavigationLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const current = isCurrent(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={`rounded-control px-3 py-2 text-sm font-medium transition-colors ${
        current ? 'bg-surface-raised text-brand' : 'text-content-muted hover:text-content'
      }`}
    >
      {label}
    </Link>
  );
}

function EntryLink({
  href,
  label,
  description,
  onClick,
}: {
  href: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-surface"
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-content-muted">{description}</span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-3">
        <Link href="/" className="shrink-0">
          <BrandMark size="sm" className="text-content" />
        </Link>

        <nav aria-label="Secciones" className="hidden flex-1 items-center gap-1 lg:flex">
          {NAVIGATION.map((entry) => (
            <NavigationLink key={entry.href} href={entry.href} label={entry.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />

          <Dropdown
            label="Opciones de ingreso"
            button={
              <span className="flex items-center gap-2 rounded-control bg-brand px-3 py-1.5 font-medium text-on-brand">
                <UserIcon className="size-4" />
                Ingresar
                <ChevronDownIcon className="size-4" />
              </span>
            }
          >
            {(close) => (
              <div className="flex flex-col">
                {SIGN_IN_ENTRIES.map((entry) => (
                  <EntryLink key={entry.href} {...entry} onClick={close} />
                ))}

                {/* Separated because asking to join is not signing in: the
                    person choosing it has no account to sign in with. */}
                <div className="border-t border-border bg-surface">
                  <EntryLink {...JOIN_ENTRY} onClick={close} />
                </div>
              </div>
            )}
          </Dropdown>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar el menú' : 'Abrir el menú'}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex size-9 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-surface-raised hover:text-content lg:hidden"
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Secciones"
          className="animate-panel-in flex flex-col gap-1 border-t border-border px-6 py-3 lg:hidden"
        >
          {NAVIGATION.map((entry) => (
            <NavigationLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
}
