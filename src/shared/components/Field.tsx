import type { ReactNode } from 'react';
import { AlertIcon } from './icons';
import { FieldRequirements } from './FieldRequirements';
import { describeField } from '@/shared/config/messages';

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
  // Taken from the shared rules by default, so a field explains itself without
  // each form repeating what the table already knows.
  requirements?: string[];
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ id, label, error, hint, requirements, children }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const rules = requirements ?? describeField(id);
  const rulesId = rules.length > 0 ? `${id}-requirements` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>

        {rulesId !== undefined && error === undefined && <FieldRequirements requirements={rules} />}
      </div>

      {hint && (
        <p id={hintId} className="text-sm text-content-muted">
          {hint}
        </p>
      )}

      {children({
        'aria-describedby': [hintId, rulesId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
      })}

      {/* A refusal has to look different from a hint. They were the same grey,
          which made every error read as advice. */}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          {rulesId === undefined ? (
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <span className="mt-0.5">
              <FieldRequirements requirements={rules} tone="alert" />
            </span>
          )}
          {error}
        </p>
      )}

      {/* The popup is a convenience, never the only copy. Somebody using a
          screen reader reaches the rules through the control itself. */}
      {rulesId !== undefined && (
        <span id={rulesId} className="sr-only">
          {rules.join(' ')}
        </span>
      )}
    </div>
  );
}

export const CONTROL_CLASS =
  'rounded-control border border-border bg-surface-raised px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger';
