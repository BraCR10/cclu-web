import { classNames } from '@/shared/utils/classNames';

export function fieldBoxClasses(hasError: boolean): string {
  return classNames(
    'w-full rounded-sm border bg-surface px-3 text-body-m text-fg placeholder:text-fg-muted',
    'focus:shadow-focus focus:outline-none',
    'disabled:border-line-subtle disabled:bg-surface-subtle disabled:text-fg-muted',
    'read-only:border-line-subtle read-only:bg-surface-subtle read-only:text-fg-secondary',
    hasError
      ? 'border-danger focus:border-danger focus:shadow-focus-danger'
      : 'border-line focus:border-focus focus:border-[1.5px]',
  );
}

export const FIELD_LABEL_CLASSES = 'text-label-m text-fg';
