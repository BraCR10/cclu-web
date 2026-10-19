'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Toast } from './Toast';
import { ToastContext, type ToastRequest } from './toastContext';

type ShownToast = ToastRequest & { id: number };

// Long enough to read a sentence in Spanish without hurrying, which is what the
// prototype asks for: a notice that disappears in five seconds is a notice
// somebody misses while they are still reading the field under it.
const DISMISS_AFTER_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const translate = useTranslations('common.toast');
  const [toasts, setToasts] = useState<ShownToast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (request: ToastRequest) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { ...request, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DISMISS_AFTER_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;

    return () => pending.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label={translate('region')}
        className="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:items-end"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tone={toast.tone}
            title={toast.title}
            message={toast.message}
            onClose={() => dismiss(toast.id)}
          />
        ))}
      </section>
    </ToastContext.Provider>
  );
}
