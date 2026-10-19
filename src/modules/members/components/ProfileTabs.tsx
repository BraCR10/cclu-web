'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

export type ProfileTab = 'profile' | 'branches' | 'store';

// The tab's own name is the message key, so the three cannot drift apart.
const TABS: { tab: ProfileTab; href: string }[] = [
  { tab: 'profile', href: '/member/profile' },
  { tab: 'branches', href: '/member/profile/branches' },
  { tab: 'store', href: '/member/profile/store' },
];

// The profile is one place made of three: what the chamber knows, the places it
// affiliates, and the shop it shows. They are separate screens because each one
// is saved on its own.
export function ProfileTabs({ active }: { active: ProfileTab }) {
  const translate = useTranslations('member.profile.tabs');
  const pathname = usePathname();

  return (
    <nav aria-label={translate('label')} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex gap-1 border-b border-line-subtle">
        {TABS.map(({ tab, href }) => {
          const selected = tab === active || pathname === href;

          return (
            <li key={tab}>
              <Link
                href={href}
                aria-current={selected ? 'page' : undefined}
                className={classNames(
                  'inline-flex min-h-11 items-center border-b-2 px-4 text-label-m whitespace-nowrap lg:min-h-10',
                  selected
                    ? 'border-primary text-fg-brand'
                    : 'border-transparent text-fg-muted hover:text-fg',
                )}
              >
                {translate(tab)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
