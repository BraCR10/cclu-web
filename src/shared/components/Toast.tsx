'use client';

import { CircleCheck, CircleX, Info, X, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type ToastTone = 'success' | 'error' | 'info';

const TONE_ICONS: Record<ToastTone, { icon: LucideIcon; color: string }> = {
  success: { icon: CircleCheck, color: 'text-success' },
  error: { icon: CircleX, color: 'text-danger' },
  info: { icon: Info, color: 'text-info' },
};

type ToastProps = {
  tone: ToastTone;
  title: string;
  message?: string;
  onClose: () => void;
};

export function Toast({ tone, title, message, onClose }: ToastProps) {
  const translate = useTranslations('common.actions');
  const { icon: Icon, color } = TONE_ICONS[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-md border border-line-subtle bg-surface px-4 py-3 shadow-overlay lg:w-[23.75rem]"
    >
      <Icon aria-hidden className={`mt-0.5 size-5 shrink-0 ${color}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-label-m text-fg">{title}</p>
        {message && <p className="text-body-s text-fg-secondary">{message}</p>}
      </div>
      <button
        type="button"
        aria-label={translate('close')}
        onClick={onClose}
        className="-my-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        <X aria-hidden className="size-[18px]" />
      </button>
    </div>
  );
}
