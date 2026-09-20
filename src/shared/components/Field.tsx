import type { ReactNode } from 'react';
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
  const hintId = hint ? `${id}-hint` : undefined;
  const rules = error === undefined ? [] : (requirements ?? describeField(id));
  const errorId = error === undefined ? undefined : `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      {/* The mark sits on the label's row, not under the control. A line that
          appears below pushes every field after it down the screen, which is
          the moment somebody loses the place they were typing in. */}
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>

        {error !== undefined && <FieldRequirements message={error} requirements={rules} />}
      </div>

      {hint && (
        <p id={hintId} className="text-sm text-content-muted">
          {hint}
        </p>
      )}

      {children({
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : undefined,
      })}

      {/* The note is a convenience, never the only copy. Somebody using a screen
          reader is told what was refused through the control itself, without
          having to find and open anything. */}
      {errorId !== undefined && (
        <span id={errorId} className="sr-only">
          {[error, ...rules].join(' ')}
        </span>
      )}
    </div>
  );
}

export const CONTROL_CLASS =
  'rounded-control border border-border bg-surface-raised px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger';
