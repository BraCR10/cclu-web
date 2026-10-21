import type { ReactNode } from 'react';
import { Globe, MessageCircle, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDates } from '@/shared/hooks/useDates';
import { SocialIcon } from '@/shared/layouts/SocialIcon';
import type { PublicProfile } from '../api/directory';
import { callHref, formatPhoneNumber, whatsappHref } from '../phoneNumber';

export function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6">
      <h2 className="text-heading-s text-fg">{title}</h2>
      {children}
    </section>
  );
}

function ContactLine({
  icon,
  href,
  children,
}: {
  icon: ReactNode;
  href: string;
  children: ReactNode;
}) {
  const external = href.startsWith('http');

  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="flex min-h-10 items-center gap-3 text-body-m break-all text-fg-link hover:underline"
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-fg-secondary">
          {icon}
        </span>
        {children}
      </a>
    </li>
  );
}

// A social account may be stored as a handle or as an address; either opens it.
function socialHref(value: string, site: string) {
  return value.startsWith('http') ? value : `https://${site}/${value.replace(/^@/, '')}`;
}

function websiteHref(value: string) {
  return value.startsWith('http') ? value : `https://${value}`;
}

export function ContactCard({ profile }: { profile: PublicProfile }) {
  const translate = useTranslations('public.directory.profile');

  return (
    <DetailCard title={translate('contact')}>
      <ul className="flex flex-col">
        {profile.phone !== null && (
          <ContactLine
            icon={<Phone aria-hidden className="size-4" />}
            href={callHref(profile.phone)}
          >
            {formatPhoneNumber(profile.phone)}
          </ContactLine>
        )}
        {profile.whatsappNumber !== null && (
          <ContactLine
            icon={<MessageCircle aria-hidden className="size-4" />}
            href={whatsappHref(profile.whatsappNumber)}
          >
            {translate('whatsappNumber', { number: formatPhoneNumber(profile.whatsappNumber) })}
          </ContactLine>
        )}
        {profile.instagram !== null && (
          <ContactLine
            icon={<SocialIcon network="instagram" />}
            href={socialHref(profile.instagram, 'instagram.com')}
          >
            {profile.instagram}
          </ContactLine>
        )}
        {profile.facebook !== null && (
          <ContactLine
            icon={<SocialIcon network="facebook" />}
            href={socialHref(profile.facebook, 'facebook.com')}
          >
            {profile.facebook}
          </ContactLine>
        )}
        {profile.linkedin !== null && (
          <ContactLine
            icon={<SocialIcon network="linkedin" />}
            href={socialHref(profile.linkedin, 'linkedin.com/company')}
          >
            {profile.linkedin}
          </ContactLine>
        )}
        {profile.website !== null && (
          <ContactLine
            icon={<Globe aria-hidden className="size-4" />}
            href={websiteHref(profile.website)}
          >
            {profile.website.replace(/^https?:\/\//, '')}
          </ContactLine>
        )}
      </ul>
    </DetailCard>
  );
}

export function CategoriesCard({ categories }: { categories: string[] }) {
  const translate = useTranslations('public.directory.profile');

  return (
    <DetailCard title={translate('categories')}>
      <ul className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <li
            key={category}
            className="rounded-xs bg-surface-subtle px-2 py-1 text-label-s text-fg"
          >
            {category}
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

export function AffiliationCard({ since }: { since: string }) {
  const translate = useTranslations('public.directory.profile');
  const dates = useDates();

  return (
    <DetailCard title={translate('affiliation')}>
      <p className="flex justify-between gap-4 text-body-s">
        <span className="text-fg-secondary">{translate('memberSince')}</span>
        <span className="text-fg">{dates.instant(since, 'short')}</span>
      </p>
    </DetailCard>
  );
}
