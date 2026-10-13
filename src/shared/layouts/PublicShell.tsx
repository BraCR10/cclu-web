'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import { BottomNav } from './BottomNav';
import { Logo } from './Logo';
import { SkipLink } from './SkipLink';
import { findActiveItem } from './navigation';
import {
  JOIN_HREF,
  SIGN_IN_HREF,
  publicBottomNavItems,
  publicHeaderItems,
  publicMoreGroups,
} from './publicNavigation';
import { useNavigationLabel } from './useNavigationLabel';

const SESSION_LINK_CLASSES =
  'inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const translate = useTranslations('public');
  const translateShell = useTranslations('common.shell');
  const labelOf = useNavigationLabel();
  const active = findActiveItem(pathname, publicHeaderItems);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-line-subtle bg-surface">
        <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 lg:h-18 lg:px-20 xl:px-0">
          <Logo className="h-9 lg:h-11" />
          <nav
            aria-label={translate('navigationLabel')}
            className="ml-6 hidden flex-1 gap-1 lg:flex"
          >
            {publicHeaderItems.map((item) => {
              const isActive = item === active;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={classNames(
                    'inline-flex min-h-9 items-center rounded-md px-3 text-label-m',
                    'focus-visible:shadow-focus focus-visible:outline-none',
                    isActive
                      ? 'bg-brand-union-soft text-fg-brand'
                      : 'text-fg-secondary hover:bg-surface-hover',
                  )}
                >
                  {labelOf(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href={SIGN_IN_HREF}
              className={`${SESSION_LINK_CLASSES} text-fg-brand hover:bg-brand-union-soft`}
            >
              {translate('session.signIn')}
            </Link>
            <Link
              href={JOIN_HREF}
              className={`${SESSION_LINK_CLASSES} hidden bg-primary text-on-primary hover:bg-primary-hover lg:inline-flex`}
            >
              {translate('session.join')}
            </Link>
          </div>
        </div>
      </header>
      <main id="content" className="flex flex-1 flex-col pb-24 lg:pb-0">
        {children}
      </main>
      <BottomNav
        label={translateShell('quickNavigation')}
        items={publicBottomNavItems}
        moreGroups={publicMoreGroups}
      />
    </div>
  );
}
