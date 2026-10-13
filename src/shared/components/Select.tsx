'use client';

import { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldMessage } from './FieldMessage';
import { FIELD_LABEL_CLASSES, fieldBoxClasses } from './fieldClasses';

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  help?: string;
  error?: string;
};

// A native select: the phone shows its own picker, and keyboard and screen
// reader support come with the element instead of being rebuilt.
export function Select({
  label,
  options,
  placeholder,
  help,
  error,
  className,
  defaultValue,
  value,
  ...rest
}: SelectProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || help);
  const initialValue = value === undefined && placeholder ? (defaultValue ?? '') : defaultValue;

  return (
    <div className={className}>
      <label htmlFor={id} className={FIELD_LABEL_CLASSES}>
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          defaultValue={value === undefined ? initialValue : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`${fieldBoxClasses(Boolean(error))} min-h-11 appearance-none pr-10 lg:min-h-10`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-[18px] -translate-y-1/2 text-fg-muted"
        />
      </div>
      {hasMessage && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} help={help} />
        </div>
      )}
    </div>
  );
}
