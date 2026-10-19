'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import type { SaveOutcome } from '../hooks/useMemberProfile';

type ChangeEmailModalProps = {
  currentEmail: string;
  saving: boolean;
  onSend: (email: string) => Promise<SaveOutcome>;
  onClose: () => void;
};

// Nothing changes here: the address has to answer first, which is why the button
// sends a link instead of saving.
export function ChangeEmailModal({ currentEmail, saving, onSend, onClose }: ChangeEmailModalProps) {
  const translate = useTranslations('member.profile.email');

  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  async function submit() {
    setError(null);

    // Written twice because there is no way to read it back once it is sent: the
    // link goes to whatever was typed.
    if (email.trim() !== confirmation.trim()) {
      setMismatch(true);
      return;
    }

    setMismatch(false);

    const outcome = await onSend(email.trim());

    if (outcome.ok) {
      onClose();
    } else {
      setError(outcome);
    }
  }

  const errorFor = (field: string) => (error?.field === field ? error.message : undefined);

  return (
    <Modal
      open
      title={translate('title')}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            {translate('cancel')}
          </Button>
          <Button type="button" loading={saving} onClick={() => void submit()}>
            {translate('send')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {error !== null && error.field === undefined && (
          <Alert tone="danger" title={error.message} />
        )}

        <Alert
          tone="info"
          title={translate('noteTitle')}
          message={translate('note', { email: currentEmail })}
        />

        <Input
          label={translate('newEmail')}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          error={errorFor('email')}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label={translate('confirmation')}
          name="emailConfirmation"
          type="email"
          autoComplete="email"
          value={confirmation}
          error={mismatch ? translate('mismatch') : undefined}
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </div>
    </Modal>
  );
}
