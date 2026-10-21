'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { DescriptionList } from '@/shared/components/DescriptionList';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { useMemberProfile } from '../hooks/useMemberProfile';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ProfileModal, type ProfileSection } from './ProfileModal';
import { ProfileTabs } from './ProfileTabs';
import { publicProfilePath } from '@/shared/utils/publicProfilePath';

type OpenPopup = ProfileSection | 'email' | null;

const MEMBER_TYPE_KEY = {
  business: 'business',
  association: 'association',
  independent_professional: 'independent',
} as const;

export function ProfilePage() {
  const translate = useTranslations('member.profile');
  const translateTypes = useTranslations('member.profile.types');
  const profile = useMemberProfile();
  const dates = useDates();

  const [openPopup, setOpenPopup] = useState<OpenPopup>(null);

  if (profile.state === 'loading') {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    );
  }

  if (profile.state === 'failed' || profile.profile === null) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <Alert tone="danger" title={profile.failureMessage ?? translate('failed')} />
      </div>
    );
  }

  const member = profile.profile;
  const typeKey = MEMBER_TYPE_KEY[member.memberType === '' ? 'business' : member.memberType];
  const publicHref = member.memberCode === null ? null : publicProfilePath(member.memberCode);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <ProfileTabs active="profile" />

      {/* Who the chamber sees, and the way to the page the clients see. */}
      <Card className="p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-heading-xl text-fg">{member.businessName}</h1>
            <p className="mt-1 text-body-m text-fg-secondary">
              {translateTypes(typeKey)} {'·'} {member.canton?.name ?? member.district}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge tone="success" label={translate('verified')} />
              {member.memberCode !== null && (
                <span className="text-label-s text-fg-muted">
                  {translate('memberCode', { code: member.memberCode })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <Button type="button" variant="secondary" onClick={() => setOpenPopup('business')}>
              {translate('edit')}
            </Button>
            {publicHref !== null && (
              <Link
                href={publicHref}
                className="flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg"
              >
                {translate('viewPublic')}
              </Link>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-heading-m text-fg">{translate('business.title')}</h2>
              <Button type="button" variant="ghost" onClick={() => setOpenPopup('business')}>
                {translate('edit')}
              </Button>
            </div>
            <div className="mt-4">
              <DescriptionList
                items={[
                  { term: translate('fields.businessName'), detail: member.businessName },
                  { term: translate('fields.managerName'), detail: member.managerName ?? '—' },
                  {
                    term: translate('fields.activity'),
                    detail: member.activity?.name ?? member.activityOther ?? '—',
                  },
                  {
                    term: translate('fields.businessDescription'),
                    detail: member.businessDescription ?? '—',
                  },
                  { term: translate('fields.branchName'), detail: member.branchName ?? '—' },
                  {
                    term: translate('fields.address'),
                    detail: [member.canton?.name, member.district, member.location]
                      .filter((part) => part !== null && part !== undefined && part !== '')
                      .join(', '),
                  },
                ]}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-heading-m text-fg">{translate('contact.title')}</h2>
              <Button type="button" variant="ghost" onClick={() => setOpenPopup('contact')}>
                {translate('edit')}
              </Button>
            </div>
            <div className="mt-4">
              <DescriptionList
                items={[
                  { term: translate('fields.phone'), detail: member.phone ?? '—' },
                  { term: translate('fields.whatsapp'), detail: member.whatsappNumber ?? '—' },
                  { term: translate('fields.billingEmail'), detail: member.billingEmail ?? '—' },
                  { term: translate('fields.website'), detail: member.website ?? '—' },
                  {
                    term: translate('fields.networks'),
                    detail:
                      [member.instagram, member.facebook, member.linkedin]
                        .filter((value) => value !== null && value !== '')
                        .join(' · ') || '—',
                  },
                ]}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-heading-m text-fg">{translate('legal.title')}</h2>
              <Button type="button" variant="ghost" onClick={() => setOpenPopup('legal')}>
                {translate('edit')}
              </Button>
            </div>
            <p className="mt-1 text-body-s text-fg-muted">{translate('legal.note')}</p>
            <div className="mt-4">
              <DescriptionList
                items={[
                  { term: translate('fields.legalName'), detail: member.legalName ?? '—' },
                  {
                    term: translate('fields.legalRepresentativeName'),
                    detail: member.legalRepresentativeName ?? '—',
                  },
                  {
                    term: translate('fields.legalRepresentativeIdentification'),
                    detail: member.legalRepresentativeIdentification ?? '—',
                  },
                  {
                    term: translate('legal.certificationIssuedAt'),
                    detail:
                      member.certificationIssuedAt === null
                        ? '—'
                        : dates.calendarDay(member.certificationIssuedAt.slice(0, 10)),
                  },
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-heading-m text-fg">{translate('account.title')}</h2>
            <div className="mt-4">
              <DescriptionList
                items={[
                  {
                    term: translate('account.name'),
                    detail: member.name ?? member.legalName ?? '—',
                  },
                  {
                    term: translate('account.identification'),
                    detail: member.identificationNumber,
                  },
                  { term: translate('account.memberCode'), detail: member.memberCode ?? '—' },
                  {
                    term: translate('account.since'),
                    detail: dates.instant(member.createdAt, 'date'),
                  },
                ]}
              />
            </div>
          </Card>

          {/* The two things that change by link rather than by form. */}
          <Card className="p-6">
            <h2 className="text-heading-m text-fg">{translate('access.title')}</h2>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="text-label-s text-fg-muted">{translate('access.email')}</p>
                <p className="mt-1 break-all text-body-m text-fg">{member.email}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => setOpenPopup('email')}
                >
                  {translate('access.changeEmail')}
                </Button>
              </div>

              <div className="border-t border-line-subtle pt-4">
                <p className="text-label-s text-fg-muted">{translate('access.password')}</p>
                <p className="mt-1 text-body-s text-fg-secondary">
                  {member.passwordChangedAt === null
                    ? translate('access.passwordNever')
                    : translate('access.passwordChanged', {
                        date: dates.instant(member.passwordChangedAt, 'date'),
                      })}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => void profile.askForPasswordLink()}
                >
                  {translate('access.sendLink')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {openPopup !== null && openPopup !== 'email' && (
        <ProfileModal
          section={openPopup}
          profile={member}
          cantons={profile.cantons}
          activities={profile.activities}
          saving={profile.saving}
          onSave={profile.save}
          onClose={() => setOpenPopup(null)}
        />
      )}

      {openPopup === 'email' && (
        <ChangeEmailModal
          currentEmail={member.email}
          saving={profile.saving}
          onSend={profile.askForEmailChange}
          onClose={() => setOpenPopup(null)}
        />
      )}
    </div>
  );
}
