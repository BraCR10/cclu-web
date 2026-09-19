'use client';

import type { Toast, ToastTone } from './useToasts';
import { AlertIcon, CheckCircleIcon, CloseIcon } from './icons';

type ToastStackProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

const TONE_ACCENT: Record<ToastTone, string> = {
  success: 'bg-support',
  info: 'bg-brand',
  problem: 'bg-highlight',
};

const TONE_ICON_CLASS: Record<ToastTone, string> = {
  success: 'text-support',
  info: 'text-brand',
  problem: 'text-content',
};

function ToneIcon({ tone }: { tone: ToastTone }) {
  const className = `size-5 shrink-0 ${TONE_ICON_CLASS[tone]}`;

  return tone === 'success' ? (
    <CheckCircleIcon className={className} />
  ) : (
    <AlertIcon className={className} />
  );
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    // Polite rather than assertive: none of these interrupt what someone is
    // doing, they report what already finished.
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in pointer-events-auto flex gap-3 overflow-hidden rounded-panel border border-border bg-surface-raised p-4 shadow-lg"
        >
          <span className={`w-1 shrink-0 self-stretch rounded-pill ${TONE_ACCENT[toast.tone]}`} />

          <ToneIcon tone={toast.tone} />

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.detail !== undefined && (
              <p className="text-sm break-words text-content-muted">{toast.detail}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar aviso"
            className="-mt-1 -mr-1 size-7 shrink-0 rounded-control text-content-muted transition-colors hover:bg-surface hover:text-content"
          >
            <CloseIcon className="mx-auto size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
