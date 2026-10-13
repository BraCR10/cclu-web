'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import { BottomNav } from './BottomNav';
import { Logo } from './Logo';
import { SkipLink } from './SkipLink';
import { ProfileMenu, type Viewer } from './ProfileMenu';
import { findActiveItem, itemsOf, type PanelNavigation } from './navigation';
import { useNavigationLabel } from './useNavigationLabel';

type PanelShellProps = {
  navigation: PanelNavigation;
  viewer?: Viewer;
  children: ReactNode;
};

export function PanelShell({ navigation, viewer, children }: PanelShellProps) {
  const pathname = usePathname();
  const translate = useTranslations('common.shell');
  const labelOf = useNavigationLabel();
  const context = labelOf(navigation.contextKey);
  const allItems = [...itemsOf(navigation.sidebar), ...navigation.bottomNav];
  const active = findActiveItem(pathname, allItems);
  const sidebarActive = findActiveItem(pathname, itemsOf(navigation.sidebar));
  const homeHref = navigation.sidebar[0]?.items[0]?.href ?? '/';

  return (
    <div className="flex min-h-dvh bg-canvas">
      <SkipLink />
      <aside className="sticky top-0 hidden h-dvh w-66 shrink-0 flex-col gap-5 overflow-y-auto bg-sidebar px-4 py-5 lg:flex">
        <div className="flex flex-col gap-2">
          <span className="flex h-16 items-center rounded-md bg-surface px-3 py-2">
            <Logo href={homeHref} className="h-12" />
          </span>
          <span className="text-caption text-fg-on-sidebar-muted">{context}</span>
        </div>
        <nav aria-label={context} className="flex flex-col gap-1">
          {navigation.sidebar.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              {group.labelKey && (
                <p className="px-3 pt-3 pb-2 text-caption text-fg-on-sidebar-muted">
                  {labelOf(group.labelKey)}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = item === sidebarActive;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames(
                      'flex min-h-9 items-center gap-3 rounded-md px-3 py-2 text-label-m',
                      'focus-visible:shadow-focus focus-visible:outline-none',
                      isActive
                        ? 'bg-sidebar-active text-fg-on-sidebar'
                        : 'text-fg-on-sidebar-muted hover:bg-brand-union-dark hover:text-fg-on-sidebar',
                    )}
                  >
                    <item.icon aria-hidden className="size-5" />
                    {labelOf(item.labelKey)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-line-subtle bg-surface pr-2 pl-4 lg:h-16 lg:px-8">
          <h1 className="flex-1 truncate font-display text-heading-m text-fg lg:text-heading-l">
            {active ? labelOf(active.labelKey) : context}
          </h1>
          <ProfileMenu viewer={viewer} profileHref={navigation.profileHref} />
        </header>
        <main id="content" className="flex flex-1 flex-col pb-24 lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav
        label={translate('quickNavigation')}
        items={navigation.bottomNav}
        moreGroups={navigation.more}
      />
    </div>
  );
}
