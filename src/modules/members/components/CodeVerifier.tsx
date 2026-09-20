'use client';

import { useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { CheckCircleIcon, CrossCircleIcon } from '@/shared/components/icons';
import { MEMBER_TYPE_LABELS } from '@/modules/admin/applicationRules';
import { verifyMemberCode, type VerificationResult } from '../api/verification';

type CodeVerifierProps = {
  verify?: (code: string) => Promise<VerificationResult>;
};

export function CodeVerifier({ verify = verifyMemberCode }: CodeVerifierProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    // The button stays pressable so the form can say what is missing. A
    // disabled one leaves the person guessing which rule they broke.
    if (code.trim() === '') {
      setFieldError(MESSAGES.required);
      return;
    }

    setFieldError(undefined);
    setChecking(true);

    try {
      setResult(await verify(code.trim()));
    } catch (caught) {
      // The API refused. That is not something the form could have caught, so
      // it is reported in the corner rather than wedged into the screen.
      show({
        tone: 'problem',
        title: messageForError(caught, { fallback: MESSAGES.verification_unavailable }),
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6"
      >
        <Field
          id="member-code"
          label="Código de agremiado"
          hint="Escríbalo como aparece en el carné. No importan las mayúsculas ni los guiones."
          error={fieldError}
        >
          {(control) => (
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                {...control}
                id="member-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="M-A7K2-Q4"
                className={`${CONTROL_CLASS} flex-1 py-3 font-mono text-lg tracking-widest tabular-nums uppercase`}
              />
              <button
                type="submit"
                disabled={checking}
                className="rounded-control bg-brand px-6 py-3 font-medium text-on-brand disabled:opacity-50"
              >
                {checking ? 'Verificando…' : 'Verificar'}
              </button>
            </div>
          )}
        </Field>
      </form>

      {result !== null && result.valid && (
        <div
          role="status"
          className="animate-panel-in flex flex-col gap-4 rounded-panel border border-support bg-surface-raised p-6"
        >
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="size-6 text-support" />
            <p className="font-medium">Afiliado de la Cámara</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Nombre</dt>
              <dd className="font-medium">{result.member.businessName}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Código</dt>
              <dd className="font-mono tabular-nums">{result.member.memberCode}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs tracking-wide text-content-muted uppercase">Tipo</dt>
              <dd>{MEMBER_TYPE_LABELS[result.member.memberType]}</dd>
            </div>
            {result.member.sector !== null && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs tracking-wide text-content-muted uppercase">Sector</dt>
                <dd>{result.member.sector}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {result !== null && !result.valid && (
        <div
          role="status"
          className="animate-panel-in flex items-start gap-3 rounded-panel border border-border bg-surface-raised p-6"
        >
          <CrossCircleIcon className="mt-0.5 size-6 text-content-muted" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">Ese código no corresponde a un afiliado</p>
            <p className="text-sm text-content-muted">
              Verifique que lo escribió completo. Si está seguro, la afiliación puede no estar
              vigente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
