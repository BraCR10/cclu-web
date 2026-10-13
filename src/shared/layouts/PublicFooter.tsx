import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from './Logo';
import { SocialIcon } from './SocialIcon';
import {
  contactLinks,
  footerLinkGroups,
  legalLinks,
  socialLinks,
  type FooterLinkGroup,
} from './publicFooterLinks';

const LINK_FOCUS_CLASSES = 'rounded-xs focus-visible:shadow-focus focus-visible:outline-none';
const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;

function FooterWave() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 32"
      preserveAspectRatio="none"
      className="hidden h-8 w-full bg-inverse fill-canvas lg:block"
    >
      <path d="M0 0H1440V22C1100 6 800 2 600 6C350 12 150 30 0 30Z" />
    </svg>
  );
}

function LinkGroup({ group }: { group: FooterLinkGroup }) {
  const translate = useTranslations('public.footer');
  const headingId = `footer-${group.id}`;

  return (
    <nav aria-labelledby={headingId} className="hidden lg:block">
      <h2 id={headingId} className="text-label-m text-fg-inverse">
        {translate(group.titleKey)}
      </h2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {group.links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className={`${LINK_FOCUS_CLASSES} text-body-m text-fg-on-sidebar-muted hover:text-fg-inverse`}
            >
              {translate(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function BrandColumn() {
  const translate = useTranslations('public.footer');

  return (
    <div className="hidden lg:block lg:w-88">
      <Logo className="h-17 rounded-md bg-surface px-4 py-3" />
      <p className="mt-6 text-body-m text-fg-on-sidebar-muted">{translate('description')}</p>
      <ul aria-label={translate('social.label')} className="mt-3 flex gap-1">
        {socialLinks.map((social) => (
          <li key={social.network}>
            <a
              href={social.href}
              aria-label={translate(social.labelKey)}
              {...EXTERNAL_LINK_PROPS}
              className={`${LINK_FOCUS_CLASSES} inline-flex size-8 items-center justify-center text-fg-inverse hover:text-fg-on-sidebar-muted`}
            >
              <SocialIcon network={social.network} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactColumn() {
  const translate = useTranslations('public.footer');
  const itemClasses =
    'inline-flex items-center gap-1.5 text-body-m text-fg-inverse lg:text-fg-on-sidebar-muted';

  return (
    <section aria-labelledby="footer-contact">
      <h2 id="footer-contact" className="sr-only text-label-m text-fg-inverse lg:not-sr-only">
        {translate('contact.title')}
      </h2>
      <ul className="flex flex-wrap gap-x-4 lg:mt-3 lg:flex-col lg:gap-2.5">
        {contactLinks.map(({ id, labelKey, href, icon: Icon }) => (
          <li key={id}>
            <a
              href={href}
              {...EXTERNAL_LINK_PROPS}
              className={`${LINK_FOCUS_CLASSES} ${itemClasses} min-h-11 hover:text-fg-inverse lg:min-h-0`}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              {translate(labelKey)}
            </a>
          </li>
        ))}
        <li className={`${itemClasses} min-h-11 lg:min-h-0`}>
          <MapPin aria-hidden className="size-4 shrink-0" />
          {translate('contact.address')}
        </li>
      </ul>
    </section>
  );
}

function LegalBar() {
  const translate = useTranslations('public.footer');

  return (
    <div className="mt-3 flex flex-col-reverse gap-3 lg:mt-12 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-fg-secondary lg:py-12">
      <p className="text-body-m text-fg-inverse lg:text-label-s lg:text-fg-on-sidebar-muted">
        {translate('copyright', { year: new Date().getFullYear() })}
      </p>
      <nav aria-label={translate('legal.label')}>
        <ul className="flex flex-wrap gap-x-4 lg:gap-x-5">
          {legalLinks.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className={`${LINK_FOCUS_CLASSES} inline-flex min-h-11 items-center text-label-m text-fg-inverse underline underline-offset-4 lg:min-h-0 lg:text-label-s lg:no-underline lg:hover:underline`}
              >
                {translate(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-brand-union-deep pb-24 lg:bg-inverse lg:pb-0">
      <FooterWave />
      <div className="mx-auto max-w-page px-4 pt-6 pb-6 lg:px-20 lg:pt-12 lg:pb-0 xl:px-0">
        <div className="lg:flex lg:gap-20">
          <BrandColumn />
          <div className="lg:flex lg:gap-10">
            {footerLinkGroups.map((group) => (
              <LinkGroup key={group.id} group={group} />
            ))}
            <ContactColumn />
          </div>
        </div>
        <LegalBar />
      </div>
    </footer>
  );
}
