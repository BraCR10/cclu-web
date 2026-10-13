'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { Lock } from 'lucide-react';
import { FieldMessage } from './FieldMessage';
import { FIELD_LABEL_CLASSES, fieldBoxClasses } from './fieldClasses';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string;
};

export function Input({ label, help, error, readOnly, className, ...rest }: InputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || help);

  return (
    <div className={className}>
      <label htmlFor={id} className={FIELD_LABEL_CLASSES}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`${fieldBoxClasses(Boolean(error))} min-h-11 lg:min-h-10 ${readOnly ? 'pr-10' : ''}`}
          {...rest}
        />
        {readOnly && (
          <Lock
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-fg-muted"
          />
        )}
      </div>
      {hasMessage && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} help={help} />
        </div>
      )}
    </div>
  );
}
