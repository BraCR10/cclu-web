'use client';

import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { CharacterCount } from '@/shared/components/CharacterCount';
import { AttachmentPicker, type Attachment } from '@/shared/components/AttachmentPicker';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import { registerPayment, type Payment, type PaymentRegistration } from '../api/membership';

const feeFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

type PaymentFormProps = {
  feeAmount: number | null;
  onRegistered: (payment: Payment) => void;
  register?: (registration: PaymentRegistration) => Promise<Payment>;
};

type FieldErrors = Partial<Record<string, string>>;

export function PaymentForm({
  feeAmount,
  onRegistered,
  register = registerPayment,
}: PaymentFormProps) {
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [paidAt, setPaidAt] = useState('');
  const [detail, setDetail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const found: FieldErrors = {};

    if (attachment === null) {
      found.attachment = 'Adjunte la foto o el PDF del comprobante.';
    }

    if (paidAt.trim() === '' || Number.isNaN(new Date(paidAt).getTime())) {
      found.paidAt = MESSAGES.required;
    }

    const detailCode = checkField('paymentDetail', detail, { required: false });

    if (detailCode !== null) {
      found.detail = messageForFieldCode('paymentDetail', detailCode);
    }

    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(['paidAt', 'detail'], found);
      return;
    }

    setSaving(true);

    try {
      const payment = await register({
        contentType: attachment!.contentType,
        content: attachment!.content,
        paidAt,
        ...(detail.trim() === '' ? {} : { detail: detail.trim() }),
      });

      setAttachment(null);
      setPaidAt('');
      setDetail('');
      onRegistered(payment);
    } catch (caught) {
      setFailure(
        messageForError(caught, {
          byStatus: { 400: 'form_incomplete' },
          fallback: MESSAGES.save_unavailable,
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold tracking-tight">Registrar un pago</h3>
        <p className="text-sm text-content-muted">
          {feeAmount === null
            ? 'La Cámara aún no ha configurado el monto de la cuota mensual.'
            : `La cuota mensual vigente es de ${feeFormatter.format(feeAmount)}.`}
        </p>
      </div>

      <AttachmentPicker
        label="Comprobante de pago"
        hint="Foto o PDF de la transferencia o el depósito."
        value={attachment}
        onChange={setAttachment}
        error={errors.attachment}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="paidAt" label="Fecha del pago" error={errors.paidAt}>
          {(control) => (
            <input
              {...control}
              id="paidAt"
              type="date"
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
              className={CONTROL_CLASS}
            />
          )}
        </Field>

        <Field id="detail" label="Detalle" hint="Opcional." error={errors.detail}>
          {(control) => (
            <div className="flex flex-col gap-1.5">
              <input
                {...control}
                id="detail"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                className={`${CONTROL_CLASS} w-full`}
              />
              <CharacterCount field="paymentDetail" value={detail} />
            </div>
          )}
        </Field>
      </div>

      {failure !== null && (
        <p role="alert" className="text-sm text-danger">
          {failure}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
        >
          {saving ? 'Enviando…' : 'Registrar pago'}
        </button>
      </div>
    </form>
  );
}
