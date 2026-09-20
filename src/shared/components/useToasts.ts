'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastTone = 'success' | 'info' | 'problem';

export type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  detail?: string;
};

// Short on purpose. These report something that already happened and none of
// them is the only copy: a refused field keeps its own mark beside the label.
const DEFAULT_DURATION = 4000;

// A notice that reports what already happened should not have to be dismissed
// to get on with the work, so it leaves on its own.
export function useToasts(duration: number = DEFAULT_DURATION) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      nextId.current += 1;
      const id = `toast-${nextId.current}`;

      setToasts((current) => [...current, { ...toast, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );

      return id;
    },
    [dismiss, duration],
  );

  // Every pending timer holds a reference to state that is about to go away.
  useEffect(() => {
    const pending = timers.current;

    return () => {
      for (const timer of pending.values()) {
        clearTimeout(timer);
      }
      pending.clear();
    };
  }, []);

  return { toasts, show, dismiss };
}
