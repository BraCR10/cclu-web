import { BriefcaseBusiness, House, ShoppingBag, Sparkles, Store } from 'lucide-react';
import type { NavigationGroup, NavigationItem } from './navigation';

const home: NavigationItem = { id: 'home', labelKey: 'public.nav.home', href: '/', icon: House };
const directory: NavigationItem = {
  id: 'directory',
  labelKey: 'public.nav.directory',
  href: '/directory',
  icon: Store,
};
const marketplace: NavigationItem = {
  id: 'marketplace',
  labelKey: 'public.nav.marketplace',
  href: '/marketplace',
  icon: ShoppingBag,
};
const jobs: NavigationItem = {
  id: 'jobs',
  labelKey: 'public.nav.jobBoard',
  href: '/jobs',
  icon: BriefcaseBusiness,
};
const plans: NavigationItem = {
  id: 'plans',
  labelKey: 'public.nav.plans',
  href: '/plans',
  icon: Sparkles,
};

export const SIGN_IN_HREF = '/login';
export const JOIN_HREF = '/register';

export const publicHeaderItems: readonly NavigationItem[] = [
  home,
  directory,
  marketplace,
  jobs,
  plans,
];

export const publicBottomNavItems: readonly NavigationItem[] = [
  home,
  directory,
  marketplace,
  { ...jobs, labelKey: 'public.nav.jobs' },
];

export const publicMoreGroups: readonly NavigationGroup[] = [{ id: 'more', items: [plans] }];
