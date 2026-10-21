import { MessageCircle, Phone, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/components/Avatar';
import { PlanBadge } from '@/shared/components/PlanBadge';
import { logoUrl, type PublicProfile } from '../api/directory';
import { callHref, formatPhoneNumber, whatsappHref } from '../phoneNumber';

const BUTTON_CLASSES =
  'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10 lg:w-56 lg:flex-none';

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Store;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-fg-secondary">
        <Icon aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-caption text-fg-muted">{label}</span>
        {children}
      </div>
    </div>
  );
}

// Who the business is and the two ways to reach it at once.
export function ProfileSummary({ profile }: { profile: PublicProfile }) {
  const translate = useTranslations('public.directory.profile');

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:flex-row lg:items-center lg:p-6">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.businessName}
            src={profile.logoFileKey === null ? undefined : logoUrl(profile.logoFileKey)}
            size="l"
          />
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="font-display text-heading-xl text-fg">{profile.businessName}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-label-s text-success">
                <ShieldCheck aria-hidden className="size-4" />
                {translate('verified')}
              </span>
              <span className="text-body-s text-fg-secondary">
                {translate('code', { code: profile.memberCode })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:gap-8">
          {profile.activity !== null && (
            <Fact icon={Store} label={translate('activity')}>
              <span className="text-label-m text-fg">{profile.activity}</span>
            </Fact>
          )}
          {profile.plan !== null && (
            <Fact icon={Sparkles} label={translate('membership')}>
              <PlanBadge planKey={profile.plan.key} name={profile.plan.name} />
            </Fact>
          )}
        </div>
      </div>

      <div className="flex gap-3 lg:flex-col">
        {profile.whatsappNumber !== null && (
          <a
            href={whatsappHref(profile.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
          >
            <MessageCircle aria-hidden className="size-4" />
            <span className="lg:hidden">{translate('whatsappShort')}</span>
            <span className="hidden lg:inline">{translate('whatsapp')}</span>
          </a>
        )}
        {profile.phone !== null && (
          <a
            href={callHref(profile.phone)}
            className={`${BUTTON_CLASSES} border border-secondary-border bg-surface text-fg hover:bg-surface-hover`}
          >
            <Phone aria-hidden className="size-4" />
            <span className="lg:hidden">{translate('callShort')}</span>
            <span className="hidden lg:inline">
              {translate('call', { phone: formatPhoneNumber(profile.phone) })}
            </span>
          </a>
        )}
      </div>
    </section>
  );
}
