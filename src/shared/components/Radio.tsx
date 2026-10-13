'use client';

import { useId, type InputHTMLAttributes } from 'react';

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string;
};

export function Radio({ label, className, ...rest }: RadioProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={`flex min-h-11 cursor-pointer items-center gap-2 lg:min-h-0 ${className ?? ''}`}
    >
      <input
        id={id}
        type="radio"
        className="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-line bg-surface checked:border-primary checked:bg-[radial-gradient(circle,var(--color-primary)_4px,transparent_5px)] focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed"
        {...rest}
      />
      <span className="text-body-m text-fg">{label}</span>
    </label>
  );
}
