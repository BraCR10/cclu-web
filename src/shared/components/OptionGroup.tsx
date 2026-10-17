import { useId, type ReactNode } from 'react';
import { FieldMessage } from './FieldMessage';
import { classNames } from '@/shared/utils/classNames';

export type OptionCard = {
  value: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

type OptionGroupProps = {
  legend: string;
  name: string;
  options: OptionCard[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

// One card per option, because here the choice is a sentence rather than a word:
// the title says what it is and the line under it says who it is for.
export function OptionGroup({ legend, name, options, value, onChange, error }: OptionGroupProps) {
  const messageId = `${useId()}-message`;

  return (
    <fieldset>
      <legend className="text-label-m text-fg">{legend}</legend>
      <div className="mt-2 flex flex-col gap-3">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={classNames(
                'flex min-h-11 cursor-pointer items-center gap-4 rounded-md border p-4 transition-colors',
                'has-[:focus-visible]:shadow-focus',
                selected
                  ? 'border-primary bg-surface-subtle'
                  : 'border-line hover:bg-surface-hover',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-describedby={error === undefined ? undefined : messageId}
                className="sr-only"
              />

              {option.icon !== undefined && (
                <span
                  aria-hidden="true"
                  className={classNames(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    selected ? 'bg-primary text-on-primary' : 'bg-surface-hover text-fg-secondary',
                  )}
                >
                  {option.icon}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block text-heading-s text-fg">{option.title}</span>
                {option.description !== undefined && (
                  <span className="mt-0.5 block text-body-m text-fg-muted">
                    {option.description}
                  </span>
                )}
              </span>

              <span
                aria-hidden="true"
                className={classNames(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  selected ? 'border-primary' : 'border-line',
                )}
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </span>
            </label>
          );
        })}
      </div>

      {error !== undefined && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} />
        </div>
      )}
    </fieldset>
  );
}
