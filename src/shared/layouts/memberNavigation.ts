import {
  BriefcaseBusiness,
  CreditCard,
  FileText,
  House,
  IdCard,
  Sparkles,
  User,
} from 'lucide-react';
import type { NavigationItem, PanelNavigation } from './navigation';

const home: NavigationItem = {
  id: 'home',
  labelKey: 'member.nav.home',
  href: '/member',
  icon: House,
};
const profile: NavigationItem = {
  id: 'profile',
  labelKey: 'member.nav.profile',
  href: '/member/profile',
  icon: User,
};
const card: NavigationItem = {
  id: 'card',
  labelKey: 'member.nav.card',
  href: '/member/card',
  icon: IdCard,
};
const membership: NavigationItem = {
  id: 'membership',
  labelKey: 'member.nav.membership',
  href: '/member/membership',
  icon: Sparkles,
};
const payments: NavigationItem = {
  id: 'payments',
  labelKey: 'member.nav.payments',
  href: '/member/payments',
  icon: CreditCard,
};
const publications: NavigationItem = {
  id: 'publications',
  labelKey: 'member.nav.publications',
  href: '/member/publications',
  icon: FileText,
};
const vacancies: NavigationItem = {
  id: 'vacancies',
  labelKey: 'member.nav.vacancies',
  href: '/member/vacancies',
  icon: BriefcaseBusiness,
};

export const memberNavigation: PanelNavigation = {
  contextKey: 'member.context',
  profileHref: profile.href,
  sidebar: [
    { id: 'main', items: [home, profile, card, membership, payments, publications, vacancies] },
  ],
  bottomNav: [
    home,
    { ...card, labelKey: 'member.bottomNav.card' },
    payments,
    { ...publications, labelKey: 'member.bottomNav.publications' },
  ],
  more: [{ id: 'account', items: [profile, membership, vacancies] }],
};
