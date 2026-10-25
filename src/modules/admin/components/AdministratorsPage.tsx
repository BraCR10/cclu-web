'use client';

import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatusBadge, type StatusTone } from '@/shared/components/StatusBadge';
import { useCurrentAccount } from '@/shared/hooks/useCurrentAccount';
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

function StatusCell({ administrator }: { administrator: Administrator }) {
  const translate = useTranslations('admin.administrators.statuses');

  return <StatusBadge tone={TONES[administrator.status]} label={translate(administrator.status)} />;
}

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

  const columns: DataColumn<Administrator>[] = [
    {
      id: 'administrator',
      header: translate('columns.administrator'),
      cell: (administrator) => (
        <NameCell name={administrator.name ?? administrator.email} detail={administrator.email} />
      ),
    },
    {
      id: 'status',
      header: translate('columns.status'),
      cell: (administrator) => <StatusCell administrator={administrator} />,
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (administrator) => <RowActions administrator={administrator} />,
    },
  ];

  function RowActions({ administrator }: { administrator: Administrator }) {
    const pending = administrator.status !== 'active' && administrator.status !== 'inactive';
    // The API refuses it either way; not offering the button is the same rule
    // said before the click rather than after it.
    const isSelf = self.status === 'ready' && self.account.id === administrator.id;

    if (isSelf) {
      return <span className="text-body-s text-fg-muted">{translate('yourAccount')}</span>;
    }

    return (
      <div className="flex items-center justify-end gap-2">
        {pending ? (
          <Button
            variant="secondary"
            size="s"
            disabled={saving}
            onClick={() => void resend(administrator.id)}
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            {translate('resend')}
          </Button>
        ) : null}
        {administrator.status === 'active' ? (
          <Button
            variant="ghost"
            size="s"
            disabled={saving}
            onClick={() => void setStatus(administrator.id, 'inactive')}
          >
            {translate('inactivate')}
          </Button>
        ) : null}
        {administrator.status === 'inactive' ? (
          <Button
            variant="secondary"
            size="s"
            disabled={saving}
            onClick={() => void setStatus(administrator.id, 'active')}
          >
            {translate('reactivate')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={translate('title')} legend={translate('description')} />

      <div className="mt-4 flex justify-end">
        <Button onClick={() => setInviting(true)}>
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          {translate('invite')}
        </Button>
      </div>

      {state === 'failed' ? (
        <div className="mt-4">
          <Alert tone="danger" title={translate('loadFailed')} message={failureMessage} />
        </div>
      ) : null}

      <div className="mt-6">
        {state === 'loading' ? (
          <p className="text-body-m text-fg-muted">{translate('loading')}</p>
        ) : (
          <DataList
            label={translate('title')}
            items={administrators}
            keyOf={(administrator) => administrator.id}
            columns={columns}
            card={(administrator) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <NameCell
                    name={administrator.name ?? administrator.email}
                    detail={administrator.email}
                  />
                  <div className="mt-2">
                    <StatusCell administrator={administrator} />
                  </div>
                </div>
                <RowActions administrator={administrator} />
              </div>
            )}
          />
        )}
      </div>

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
    </>
  );
}
