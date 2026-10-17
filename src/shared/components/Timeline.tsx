import { Check } from 'lucide-react';
import { classNames } from '@/shared/utils/classNames';

export type TimelineStep = {
  title: string;
  detail: string;
  statusLabel: string;
  state: 'done' | 'current' | 'pending';
  moment?: string;
};

// What happens after a registration arrives, drawn as the four moments it
// passes through rather than written as a paragraph nobody reads to the end.
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const reached = step.state !== 'pending';

        return (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={classNames(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-s',
                  reached ? 'bg-primary text-on-primary' : 'border border-line text-fg-muted',
                )}
              >
                {step.state === 'done' ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={classNames(
                    'w-0.5 flex-1',
                    step.state === 'done' ? 'bg-primary' : 'bg-line-subtle',
                  )}
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pb-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-heading-s text-fg">{step.title}</h3>
                <span className="text-body-s text-fg-muted">{step.moment ?? step.statusLabel}</span>
              </div>
              <p className="mt-1 text-body-m text-fg-secondary">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
