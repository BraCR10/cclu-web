'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ellipsis, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import { MoreSheet } from './MoreSheet';
import { findActiveItem, itemsOf, type NavigationGroup, type NavigationItem } from './navigation';
import { useNavigationLabel } from './useNavigationLabel';

type BottomNavProps = {
  label: string;
  items: readonly NavigationItem[];
  moreGroups: readonly NavigationGroup[];
};

const TAB_CLASSES =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-caption focus-visible:shadow-focus focus-visible:outline-none';

function TabContent({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className={classNames(
          'flex h-7 w-14 items-center justify-center rounded-full',
          active && 'bg-brand-union-soft',
        )}
      >
        <Icon className="size-5" />
      </span>
      <span>{label}</span>
    </>
  );
}

export function BottomNav({ label, items, moreGroups }: BottomNavProps) {
  const pathname = usePathname();
  const translate = useTranslations('common.shell');
  const labelOf = useNavigationLabel();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = findActiveItem(pathname, [...items, ...itemsOf(moreGroups)]);
  const moreIsActive = active !== undefined && !items.includes(active);

  return (
    <>
      <nav
        aria-label={label}
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line-subtle bg-surface pt-1 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        {items.map((item) => {
          const isActive = item === active;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={classNames(TAB_CLASSES, isActive ? 'text-fg-brand' : 'text-fg-secondary')}
            >
              <TabContent icon={item.icon} label={labelOf(item.labelKey)} active={isActive} />
            </Link>
          );
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setMoreOpen(true)}
          className={classNames(TAB_CLASSES, moreIsActive ? 'text-fg-brand' : 'text-fg-secondary')}
        >
          <TabContent icon={Ellipsis} label={translate('more')} active={moreIsActive} />
        </button>
      </nav>
      <MoreSheet
        open={moreOpen}
        title={translate('moreOptions')}
        groups={moreGroups}
        onClose={() => setMoreOpen(false)}
      />
    </>
  );
}
