'use client';

import { useId, useState, type ChangeEvent, type TextareaHTMLAttributes } from 'react';
import { classNames } from '@/shared/utils/classNames';
import { FieldMessage } from './FieldMessage';
import { FIELD_LABEL_CLASSES, fieldBoxClasses } from './fieldClasses';

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  help?: string;
  error?: string;
};

function lengthOf(value: TextareaProps['value'] | TextareaProps['defaultValue']): number {
  return typeof value === 'string' ? value.length : 0;
}

export function Textarea({
  label,
  help,
  error,
  maxLength,
  value,
  defaultValue,
  onChange,
  className,
  rows = 4,
  ...rest
}: TextareaProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const [typedLength, setTypedLength] = useState(lengthOf(defaultValue));
  const currentLength = value === undefined ? typedLength : lengthOf(value);
  const hasMessage = Boolean(error || help);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setTypedLength(event.target.value.length);
    onChange?.(event);
  }

  return (
    <div className={className}>
      <label htmlFor={id} className={FIELD_LABEL_CLASSES}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={`${fieldBoxClasses(Boolean(error))} mt-2 block py-2`}
        {...rest}
      />
      <div className="mt-2 flex justify-between gap-3">
        <FieldMessage id={messageId} error={error} help={help} />
        {maxLength !== undefined && (
          <span
            aria-hidden
            className={classNames('ml-auto text-body-s', error ? 'text-danger' : 'text-fg-muted')}
          >
            {`${currentLength}/${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
}
