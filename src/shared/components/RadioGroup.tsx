import { useId, type ReactNode } from 'react';
import { FieldMessage } from './FieldMessage';

type RadioGroupProps = {
  legend: string;
  error?: string;
  children: ReactNode;
};

export function RadioGroup({ legend, error, children }: RadioGroupProps) {
  const messageId = `${useId()}-message`;

  return (
    <fieldset aria-describedby={error ? messageId : undefined}>
      <legend className="text-label-m text-fg">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">{children}</div>
      {error && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} />
        </div>
      )}
    </fieldset>
  );
}
