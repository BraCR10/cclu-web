'use client';

import type { ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 's' | 'm' | 'l';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover disabled:bg-surface-hover disabled:text-fg-muted',
  secondary:
    'border border-secondary-border bg-surface text-fg hover:bg-surface-hover disabled:border-line-subtle disabled:bg-surface-subtle disabled:text-fg-muted',
  ghost: 'text-fg-brand hover:bg-brand-union-soft disabled:bg-transparent disabled:text-fg-muted',
  danger:
    'bg-danger text-fg-inverse hover:brightness-90 disabled:bg-surface-hover disabled:text-fg-muted disabled:brightness-100',
  success:
    'bg-success text-fg-inverse hover:brightness-90 disabled:bg-surface-hover disabled:text-fg-muted disabled:brightness-100',
};

// The prototype draws S and M at 32 and 40 px, too small for a finger, so on
// mobile every size grows to the 44 px touch target.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  s: 'min-h-11 px-3 lg:min-h-8',
  m: 'min-h-11 px-4 lg:min-h-10',
  l: 'min-h-12 px-5',
};

export function Button({
  variant = 'primary',
  size = 'm',
  loading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const translate = useTranslations('common.actions');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-sm text-label-m transition-colors',
        'focus-visible:shadow-focus focus-visible:outline-none disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <>
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          <span className="sr-only">{translate('loading')}</span>
        </>
      )}
      {children}
    </button>
  );
}
