'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';
import { Modal } from './Modal';
import { Textarea } from './Textarea';

export type ReasonLength = { minimum: number; maximum: number };

type ReasonDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  confirmLabel: string;
  length: ReasonLength;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
};

type ReasonFormProps = Omit<ReasonDialogProps, 'open'>;

// An action the affected person is told about, such as a rejection, needs a
// reason they can read. Nothing is sent until the reason fits its limits.
export function ReasonDialog({ open, ...form }: ReasonDialogProps) {
  // Mounting the form only while open starts every opening with an empty reason.
  return open ? <ReasonForm {...form} /> : null;
}

function ReasonForm({
  title,
  description,
  label,
  confirmLabel,
  length,
  onConfirm,
  onClose,
}: ReasonFormProps) {
  const translate = useTranslations('common.reason');
  const translateActions = useTranslations('common.actions');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);

  async function confirm() {
    const text = reason.trim();

    if (text.length < length.minimum || text.length > length.maximum) {
      setError(translate('length', length));
      return;
    }

    setSending(true);

    try {
      await onConfirm(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3 lg:justify-end">
          <Button
            variant="secondary"
            className="flex-1 lg:flex-none"
            onClick={onClose}
            disabled={sending}
          >
            {translateActions('cancel')}
          </Button>
          <Button
            variant="danger"
            className="flex-1 lg:flex-none"
            onClick={() => void confirm()}
            loading={sending}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {description && <p className="text-body-m text-fg-secondary">{description}</p>}
        <Textarea
          label={label}
          maxLength={length.maximum}
          value={reason}
          error={error}
          onChange={(event) => {
            setReason(event.target.value);
            setError(undefined);
          }}
        />
      </div>
    </Modal>
  );
}
