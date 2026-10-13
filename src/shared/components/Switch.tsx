'use client';

import { useId } from 'react';
import { classNames } from '@/shared/utils/classNames';

type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({ label, checked, onChange, disabled = false }: SwitchProps) {
  const labelId = useId();

  return (
    <div className="flex min-h-11 items-center gap-3 lg:min-h-0">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={classNames(
          'inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
          'focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-line',
        )}
      >
        <span
          aria-hidden
          className={classNames(
            'size-4 rounded-full bg-surface shadow-raised transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
      <span id={labelId} className="text-body-m text-fg">
        {label}
      </span>
    </div>
  );
}
