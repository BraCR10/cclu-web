import {
  ChartColumn,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  ListTree,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import type { NavigationItem, PanelNavigation } from './navigation';

function adminItem(id: string, path: string, icon: NavigationItem['icon']): NavigationItem {
  return { id, labelKey: `admin.nav.${id}`, href: `/admin${path}`, icon };
}

const overview = adminItem('overview', '', LayoutDashboard);
const applications = adminItem('applications', '/applications', ClipboardList);
const payments = adminItem('payments', '/payments', CreditCard);
const members = adminItem('members', '/members', Users);
const memberships = adminItem('memberships', '/memberships', Sparkles);
const moderation = adminItem('moderation', '/moderation', ShieldCheck);
const reports = adminItem('reports', '/reports', ChartColumn);
const subscribers = adminItem('subscribers', '/subscribers', Mail);
const plans = adminItem('plans', '/plans', Wallet);
const administrators = adminItem('administrators', '/administrators', UserCog);
const activities = adminItem('activities', '/activities', ListTree);
const profile = adminItem('profile', '/profile', User);

export const adminNavigation: PanelNavigation = {
  contextKey: 'admin.context',
  profileHref: profile.href,
  sidebar: [
    { id: 'general', labelKey: 'admin.groups.general', items: [overview] },
    {
      id: 'management',
      labelKey: 'admin.groups.management',
      items: [applications, payments, members, memberships, moderation],
    },
    { id: 'tools', labelKey: 'admin.groups.tools', items: [reports, subscribers] },
    {
      id: 'settings',
      labelKey: 'admin.groups.settings',
      items: [plans, administrators, activities],
    },
    { id: 'account', items: [profile] },
  ],
  bottomNav: [
    overview,
    { ...applications, labelKey: 'admin.bottomNav.applications' },
    payments,
    members,
  ],
  more: [
    { id: 'management', labelKey: 'admin.groups.management', items: [memberships, moderation] },
    { id: 'tools', labelKey: 'admin.groups.tools', items: [reports, subscribers] },
    {
      id: 'settings',
      labelKey: 'admin.groups.settings',
      items: [plans, administrators, activities],
    },
    { id: 'account', labelKey: 'admin.groups.account', items: [profile] },
  ],
};
