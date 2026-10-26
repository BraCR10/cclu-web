'use client';

import { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge, type StatusTone } from '@/shared/components/StatusBadge';
import { useCurrentAccount } from '@/shared/hooks/useCurrentAccount';
import { useDates } from '@/shared/hooks/useDates';
import { useAdministrators } from '../hooks/useAdministrators';
import type { Administrator, AdministratorStatus } from '../api/administrators';

// The state of an invitation is read from its date, so a link that ran out says
// so without anyone having written it down.
const TONES: Record<AdministratorStatus, StatusTone> = {
  active: 'success',
  invitation_pending: 'info',
  invitation_expired: 'warning',
  inactive: 'neutral',
};

function displayNameOf(administrator: Administrator) {
  return administrator.name ?? administrator.email;
}

function StatusCell({ administrator }: { administrator: Administrator }) {
  const translate = useTranslations('admin.administrators.statuses');

  return <StatusBadge tone={TONES[administrator.status]} label={translate(administrator.status)} />;
}

// An account still waiting on its invitation has never come in, so what is
// worth knowing about it is when the link stops working.
function LastAccessCell({ administrator }: { administrator: Administrator }) {
  const translate = useTranslations('admin.administrators.lastAccess');
  const dates = useDates();
  const isInvitation =
    administrator.status === 'invitation_pending' || administrator.status === 'invitation_expired';

  if (isInvitation && administrator.invitationExpiresAt) {
    const date = dates.instant(administrator.invitationExpiresAt, 'short');

    return administrator.status === 'invitation_pending'
      ? translate('expires', { date })
      : translate('expired', { date });
  }

  return administrator.lastSignInAt
    ? dates.instant(administrator.lastSignInAt, 'moment')
    : translate('never');
}

type RowActionsProps = {
  administrator: Administrator;
  isSelf: boolean;
  saving: boolean;
  onResend: (adminId: string) => void;
  onSetStatus: (adminId: string, status: 'active' | 'inactive') => void;
};

function RowActions({ administrator, isSelf, saving, onResend, onSetStatus }: RowActionsProps) {
  const translate = useTranslations('admin.administrators');
  const isInvitation =
    administrator.status === 'invitation_pending' || administrator.status === 'invitation_expired';

  // The API refuses it either way; not offering the button is the same rule
  // said before the click rather than after it.
  if (isSelf) {
    return <span className="text-body-s text-fg-muted">{translate('yourAccount')}</span>;
  }

  if (isInvitation) {
    return (
      <Button
        variant="secondary"
        size="s"
        disabled={saving}
        onClick={() => onResend(administrator.id)}
      >
        <Mail aria-hidden="true" className="h-4 w-4" />
        {translate('resend')}
      </Button>
    );
  }

  return administrator.status === 'active' ? (
    <Button
      variant="ghost"
      size="s"
      disabled={saving}
      onClick={() => onSetStatus(administrator.id, 'inactive')}
    >
      {translate('inactivate')}
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="s"
      disabled={saving}
      onClick={() => onSetStatus(administrator.id, 'active')}
    >
      {translate('reactivate')}
    </Button>
  );
}

// A-13: who can open the panel, and the invitations still on their way.
export function AdministratorsPage() {
  const translate = useTranslations('admin.administrators');
  const self = useCurrentAccount();
  const { state, failureMessage, administrators, saving, invite, resend, setStatus } =
    useAdministrators();

  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<{ message: string; field?: string } | null>(null);

  const closeInvite = () => {
    setInviting(false);
    setName('');
    setEmail('');
    setFormError(null);
  };

  const submitInvite = async () => {
    const outcome = await invite({ name: name.trim(), email: email.trim() });

    if (outcome.ok) {
      closeInvite();
      return;
    }

    setFormError({ message: outcome.message, field: outcome.field });
  };

  const actionsOf = (administrator: Administrator) => (
    <RowActions
      administrator={administrator}
      isSelf={self.status === 'ready' && self.account.id === administrator.id}
      saving={saving}
      onResend={(adminId) => void resend(adminId)}
      onSetStatus={(adminId, status) => void setStatus(adminId, status)}
    />
  );

  const columns: DataColumn<Administrator>[] = [
    {
      id: 'name',
      header: translate('columns.name'),
      cell: (administrator) => (
        <div className="flex items-center gap-3">
          <Avatar name={displayNameOf(administrator)} size="s" />
          <span className="truncate">{displayNameOf(administrator)}</span>
        </div>
      ),
    },
    {
      id: 'email',
      header: translate('columns.email'),
      cell: (administrator) => administrator.email,
    },
    {
      id: 'status',
      header: translate('columns.status'),
      cell: (administrator) => <StatusCell administrator={administrator} />,
    },
    {
      id: 'lastAccess',
      header: translate('columns.lastAccess'),
      cell: (administrator) => <LastAccessCell administrator={administrator} />,
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: actionsOf,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader title={translate('title')} />
        <Button className="self-start lg:self-auto" onClick={() => setInviting(true)}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          {translate('invite')}
        </Button>
      </div>

      {state === 'failed' ? (
        <Alert tone="danger" title={translate('loadFailed')} message={failureMessage} />
      ) : null}

      {state === 'loading' ? (
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : null}

      {state === 'ready' ? (
        <DataList
          label={translate('title')}
          items={administrators}
          keyOf={(administrator) => administrator.id}
          columns={columns}
          card={(administrator) => (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <NameCell name={displayNameOf(administrator)} detail={administrator.email} />
                <StatusCell administrator={administrator} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-body-s text-fg-muted">
                  <LastAccessCell administrator={administrator} />
                </span>
                {actionsOf(administrator)}
              </div>
            </div>
          )}
        />
      ) : null}

      <Modal
        open={inviting}
        onClose={closeInvite}
        title={translate('inviteTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeInvite}>
              {translate('cancel')}
            </Button>
            <Button disabled={saving} onClick={() => void submitInvite()}>
              {translate('sendInvitation')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-m text-fg-muted">{translate('inviteDescription')}</p>
          <Input
            label={translate('name')}
            value={name}
            error={formError?.field === 'name' ? formError.message : undefined}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label={translate('email')}
            type="email"
            value={email}
            error={formError?.field === 'email' ? formError.message : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />
          {formError && !formError.field ? <Alert tone="danger" title={formError.message} /> : null}
        </div>
      </Modal>
    </div>
  );
}
