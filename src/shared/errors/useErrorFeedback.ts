'use client';

import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from './useErrorPresenter';

export type FieldError = { field: string; message: string };

// Shows what belongs in a toast and hands back what belongs under an input,
// so a form only ever renders field errors.
export function useErrorFeedback(): (error: unknown) => FieldError | null {
  const present = useErrorPresenter();
  const { showToast } = useToast();

  return (error) => {
    const presented = present(error);

    if (presented.placement === 'field') {
      return { field: presented.field, message: presented.message };
    }

    showToast({ tone: 'error', title: presented.message });
    return null;
  };
}
