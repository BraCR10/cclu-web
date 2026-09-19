import type { ReactNode } from 'react';

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

// The error is tied to the input by id rather than only shown near it, so a
// screen reader announces which field the message belongs to.
export function Field({ id, label, error, hint, children }: FieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

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

      {children(describedBy)}

      {error && (
        <p id={errorId} className="text-sm text-content-muted">
          {error}
        </p>
      )}
    </div>
  );
}

export const CONTROL_CLASS =
  'rounded-control border border-border bg-surface-raised px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand';
