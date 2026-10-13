'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { FieldMessage } from './FieldMessage';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string;
  error?: string;
};

export function Checkbox({ label, error, className, ...rest }: CheckboxProps) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2 lg:min-h-0">
        <span className="relative inline-flex size-[18px] shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? messageId : undefined}
            className="peer size-[18px] cursor-pointer appearance-none rounded-xs border-[1.5px] border-line bg-surface checked:border-primary checked:bg-primary focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-subtle aria-invalid:border-danger"
            {...rest}
          />
          <Check
            aria-hidden
            className="pointer-events-none absolute inset-0.5 hidden size-3.5 text-on-primary peer-checked:block"
          />
        </span>
        <span className="text-body-m text-fg">{label}</span>
      </label>
      {error && <FieldMessage id={messageId} error={error} />}
    </div>
  );
}
