import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

type StepperProps = {
  steps: string[];
  currentStep: number;
};

function indicatorClasses(reached: boolean, current: boolean) {
  return classNames(
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-s',
    reached && 'bg-primary text-on-primary',
    !reached && current && 'border-2 border-primary text-fg-brand',
    !reached && !current && 'border border-line text-fg-muted',
  );
}

// The three labels do not sit side by side on a telephone. Below lg the same
// position is told in words with a bar under it; from lg the labels are drawn
// with the connectors between them.
export function Stepper({ steps, currentStep }: StepperProps) {
  const translate = useTranslations('common.stepper');
  const upcoming = steps[currentStep];

  return (
    <div>
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-label-m text-fg-muted">
            {translate('stepOf', { step: currentStep, total: steps.length })}
          </p>
          {upcoming !== undefined && (
            <p className="text-label-m text-fg-secondary">
              {translate('next', { step: upcoming })}
            </p>
          )}
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-subtle">
          <div
            className="h-1 rounded-full bg-primary"
            style={{ width: `${Math.round((currentStep / steps.length) * 100)}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center lg:flex">
        {steps.map((step, index) => {
          const position = index + 1;
          const reached = position < currentStep;
          const current = position === currentStep;

          return (
            <li key={step} className="flex items-center">
              {index > 0 && <span aria-hidden="true" className="mx-4 h-0.5 w-16 bg-line" />}
              <span className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
                <span className={indicatorClasses(reached, current)}>
                  {reached ? <Check aria-hidden="true" className="h-4 w-4" /> : position}
                </span>
                <span className={classNames('text-label-m', current ? 'text-fg' : 'text-fg-muted')}>
                  {step}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
