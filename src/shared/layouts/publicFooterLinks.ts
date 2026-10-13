import { Globe, Mail, MessageCircle, type LucideIcon } from 'lucide-react';
import type { MessageKeys, NestedKeyOf } from 'next-intl';
import type { Messages } from '@/i18n/messages';
import { JOIN_HREF, SIGN_IN_HREF } from './publicNavigation';

type FooterMessages = Messages['public']['footer'];

export type FooterMessageKey = MessageKeys<FooterMessages, NestedKeyOf<FooterMessages>>;

export type FooterLink = {
  id: string;
  labelKey: FooterMessageKey;
  href: string;
};

export type FooterLinkGroup = {
  id: string;
  titleKey: FooterMessageKey;
  links: readonly FooterLink[];
};

export type ContactLink = FooterLink & { icon: LucideIcon };

export type SocialNetwork = 'facebook' | 'instagram' | 'linkedin';

export type SocialLink = {
  network: SocialNetwork;
  labelKey: FooterMessageKey;
  href: string;
};

export const footerLinkGroups: readonly FooterLinkGroup[] = [
  {
    id: 'explore',
    titleKey: 'explore.title',
    links: [
      { id: 'directory', labelKey: 'explore.directory', href: '/directory' },
      { id: 'marketplace', labelKey: 'explore.marketplace', href: '/marketplace' },
      { id: 'promotions', labelKey: 'explore.promotions', href: '/promotions' },
      { id: 'jobs', labelKey: 'explore.jobs', href: '/jobs' },
      { id: 'plans', labelKey: 'explore.plans', href: '/plans' },
    ],
  },
  {
    id: 'members',
    titleKey: 'members.title',
    links: [
      { id: 'join', labelKey: 'members.join', href: JOIN_HREF },
      { id: 'signIn', labelKey: 'members.signIn', href: SIGN_IN_HREF },
      { id: 'discounts', labelKey: 'members.discounts', href: '/discounts' },
      { id: 'verifyCard', labelKey: 'members.verifyCard', href: '/verify-card' },
    ],
  },
];

export const contactLinks: readonly ContactLink[] = [
  {
    id: 'whatsApp',
    labelKey: 'contact.whatsApp',
    href: 'https://wa.me/50661282812',
    icon: MessageCircle,
  },
  {
    id: 'email',
    labelKey: 'contact.email',
    href: 'mailto:info@camaralaunion.com',
    icon: Mail,
  },
  {
    id: 'website',
    labelKey: 'contact.website',
    href: 'https://www.camaralaunion.com',
    icon: Globe,
  },
];

export const socialLinks: readonly SocialLink[] = [
  {
    network: 'facebook',
    labelKey: 'social.facebook',
    href: 'https://www.facebook.com/camaralaunion',
  },
  {
    network: 'instagram',
    labelKey: 'social.instagram',
    href: 'https://www.instagram.com/camaralaunion',
  },
  {
    network: 'linkedin',
    labelKey: 'social.linkedin',
    href: 'https://www.linkedin.com/company/camaralaunion',
  },
];

export const legalLinks: readonly FooterLink[] = [
  { id: 'bylaws', labelKey: 'legal.bylaws', href: '/bylaws' },
  { id: 'terms', labelKey: 'legal.terms', href: '/terms' },
  { id: 'privacy', labelKey: 'legal.privacy', href: '/privacy' },
];
