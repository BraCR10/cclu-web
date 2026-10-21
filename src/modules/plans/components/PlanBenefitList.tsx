import { CircleCheck, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import type { CardBenefit } from '../planBenefits';

type PlanBenefitListProps = {
  benefits: CardBenefit[];
  label: string;
  className?: string;
};

// What a plan lets a member do, one right per row. A locked right keeps its row
// and says so, which is what tells a member what a better plan adds.
export function PlanBenefitList({ benefits, label, className }: PlanBenefitListProps) {
  const translate = useTranslations('plans');

  return (
    <ul aria-label={label} className={classNames('flex flex-col gap-3', className)}>
      {benefits.map((benefit) => {
        const isLocked = benefit.value === 'locked';
        const Icon = isLocked ? Lock : CircleCheck;

        return (
          <li
            key={benefit.id}
            className={classNames('flex gap-2 text-body-s', isLocked ? 'text-fg-muted' : 'text-fg')}
          >
            <Icon
              aria-hidden
              className={classNames('mt-0.5 size-4 shrink-0', !isLocked && 'text-success')}
            />
            <span>
              {translate(`cardBenefits.${benefit.label}`)}
              {isLocked && (
                <span className="sr-only">{`, ${translate('comparison.values.locked')}`}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
