'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { PageHeader } from '@/shared/components/PageHeader';
import { PasswordRules } from '@/shared/components/PasswordRules';
import { StatusBadge, type StatusTone } from '@/shared/components/StatusBadge';
import { useAdminProfile } from '../hooks/useAdminProfile';
import type { AdminAccountStatus } from '../api/profile';

const TONES: Record<AdminAccountStatus, StatusTone> = {
  active: 'success',
  invitation_pending: 'info',
  invitation_expired: 'warning',
  inactive: 'neutral',
};

export function AdminProfilePage() {
  const translate = useTranslations('admin.profile');
  const translateStatus = useTranslations('admin.profile.statuses');
  const {
    state,
    failureMessage,
    profile,
    saving,
    saveName,
    savePassword,
    confirmName,
    confirmPassword,
  } = useAdminProfile();

  // The field starts where the API says the name is; once the person types, their
  // draft wins, so a late answer never overwrites what they are writing.
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const name = nameDraft ?? profile?.name ?? '';
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  // A refusal that is not about the field itself (a network failure, a server
  // one) has nowhere else to go, so it is shown above the buttons.
  const [nameProblem, setNameProblem] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<{ message: string; field?: string } | null>(
    null,
  );

  const submitName = async () => {
    const outcome = await saveName(name.trim());

    if (outcome.ok) {
      setNameError(undefined);
      setNameProblem(null);
      confirmName();
      return;
    }

    setNameError(outcome.field === 'name' ? outcome.message : undefined);
    setNameProblem(outcome.field === 'name' ? null : outcome.message);
  };

  const submitPassword = async () => {
    const outcome = await savePassword(currentPassword, newPassword);

    if (outcome.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordError(null);
      confirmPassword();
      return;
    }

    setPasswordError({ message: outcome.message, field: outcome.field });
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader title={translate('title')} legend={translate('description')} />

      {state === 'failed' ? (
        <Alert tone="danger" title={translate('loadFailed')} message={failureMessage} />
      ) : null}

      {state === 'loading' ? (
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : null}

      {state === 'ready' && profile !== null ? (
        <>
          <Card className="p-6 lg:p-8">
            <h2 className="text-heading-m text-fg">{translate('accountTitle')}</h2>
            <p className="mt-1 text-body-m text-fg-secondary">{translate('accountHelp')}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label={translate('name')}
                value={name}
                error={nameError}
                onChange={(event) => setNameDraft(event.target.value)}
              />
              {/* The address is shown and not offered: changing it takes a
                  verification this screen does not carry. */}
              <Input label={translate('email')} value={profile.email} readOnly disabled />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <StatusBadge
                tone={TONES[profile.accountStatus]}
                label={translateStatus(profile.accountStatus)}
              />
              <span className="text-body-s text-fg-muted">{translate('statusHelp')}</span>
            </div>

            <div className="mt-6 flex justify-end">
              <Button disabled={saving} onClick={() => void submitName()}>
                {translate('saveName')}
              </Button>
            </div>

            {nameProblem !== null ? (
              <div className="mt-4">
                <Alert tone="danger" title={nameProblem} />
              </div>
            ) : null}
          </Card>

          <Card className="p-6 lg:p-8">
            <h2 className="text-heading-m text-fg">{translate('passwordTitle')}</h2>
            <p className="mt-1 text-body-m text-fg-secondary">{translate('passwordHelp')}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label={translate('currentPassword')}
                type="password"
                value={currentPassword}
                error={
                  passwordError?.field === 'currentPassword' ? passwordError.message : undefined
                }
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <div>
                <Input
                  label={translate('newPassword')}
                  type="password"
                  value={newPassword}
                  error={passwordError?.field === 'newPassword' ? passwordError.message : undefined}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <PasswordRules password={newPassword} />
              </div>
            </div>

            {/* The three password rules are refused on `newPassword`, so that
                refusal belongs under that field rather than in a banner. */}
            {passwordError !== null &&
            passwordError.field !== 'currentPassword' &&
            passwordError.field !== 'newPassword' ? (
              <div className="mt-4">
                <Alert tone="danger" title={passwordError.message} />
              </div>
            ) : null}

            <div className="mt-6 flex justify-end">
              <Button disabled={saving} onClick={() => void submitPassword()}>
                {translate('savePassword')}
              </Button>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
