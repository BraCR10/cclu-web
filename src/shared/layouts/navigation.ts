import type { NotificationAudience } from '@/shared/api/notifications';
import type { LucideIcon } from 'lucide-react';

export type NavigationItem = {
  readonly id: string;
  readonly labelKey: string;
  readonly href: string;
  readonly icon: LucideIcon;
};

export type NavigationGroup = {
  readonly id: string;
  readonly labelKey?: string;
  readonly items: readonly NavigationItem[];
};

export type PanelNavigation = {
  readonly contextKey: string;
  readonly audience: NotificationAudience;
  readonly profileHref: string;
  readonly notificationsHref: string;
  readonly sidebar: readonly NavigationGroup[];
  readonly bottomNav: readonly NavigationItem[];
  readonly more: readonly NavigationGroup[];
};

function isWithin(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The longest address wins, so a page under /member/profile marks "Mi perfil"
// rather than the "Inicio" at /member that also contains it.
export function findActiveItem<Item extends NavigationItem>(
  pathname: string,
  items: readonly Item[],
): Item | undefined {
  return items
    .filter((item) => isWithin(pathname, item.href))
    .sort((first, second) => second.href.length - first.href.length)[0];
}

export function itemsOf(groups: readonly NavigationGroup[]): NavigationItem[] {
  return groups.flatMap((group) => group.items);
}
