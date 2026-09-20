import type { ReactNode } from 'react';
import { AlertIcon } from './icons';

// What the control needs so a screen reader ties the message to it, and so the
// control can style itself as wrong. Spread rather than wired by hand in every
// form, which is how one of them ends up forgetting.
export type FieldControlProps = {
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
};

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ id, label, error, hint, children }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-content-muted">
          {hint}
        </p>
      )}

      {children({
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
      })}

      {/* A refusal has to look different from a hint. They were the same grey,
          which made every error read as advice. */}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export const CONTROL_CLASS =
  'rounded-control border border-border bg-surface-raised px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger';
