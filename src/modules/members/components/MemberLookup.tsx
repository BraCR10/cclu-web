'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { MESSAGES } from '@/shared/config/messages';
import { directoryPathFor, isMemberCodeShape, normalizeMemberCode } from '../memberCard';

type MemberLookupProps = {
  navigate?: (path: string) => void;
};

// A shortcut alongside the full listing above: the code is what the QR on a
// member card points at, and typing it in is faster than filtering for one
// business by hand.
export function MemberLookup({ navigate }: MemberLookupProps) {
  const router = useRouter();
  const goTo = navigate ?? ((path: string) => router.push(path));
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The button stays pressable so the form can say what is wrong. A disabled
    // one leaves the person guessing which rule they broke.
    if (code.trim() === '') {
      setError(MESSAGES.required);
      return;
    }

    if (!isMemberCodeShape(code)) {
      setError(MESSAGES.invalid_format);
      return;
    }

    setError(undefined);
    goTo(directoryPathFor(normalizeMemberCode(code)));
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Consultar un afiliado</h2>
        <p className="text-sm text-content-muted">
          Si tiene el código de un agremiado, puede ver su ficha ahora mismo.
        </p>
      </div>

      <Field
        id="lookup-code"
        label="Código de agremiado"
        hint="Escríbalo como aparece en el carné. No importan las mayúsculas ni los guiones."
        error={error}
      >
        {(control) => (
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              {...control}
              id="lookup-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="M-A7K2-Q4"
              className={`${CONTROL_CLASS} flex-1 py-3 font-mono text-lg tracking-widest tabular-nums uppercase`}
            />
            <button
              type="submit"
              className="rounded-control bg-brand px-6 py-3 font-medium text-on-brand"
            >
              Ver ficha
            </button>
          </div>
        )}
      </Field>
    </form>
  );
}
