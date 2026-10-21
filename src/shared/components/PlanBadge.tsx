import { Sparkles } from 'lucide-react';
import { classNames } from '@/shared/utils/classNames';
import type { PlanKey } from '@/shared/api/planKey';

const PLAN_CLASSES: Record<PlanKey, string> = {
  free: 'bg-plan-free text-plan-free-fg',
  lite: 'bg-plan-lite text-plan-lite-fg',
  pro: 'bg-plan-pro text-plan-pro-fg',
  premium: 'bg-plan-premium text-plan-premium-fg',
};

type PlanBadgeProps = {
  planKey: PlanKey;
  name: string;
};

export function PlanBadge({ planKey, name }: PlanBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex h-6 items-center gap-1 self-start rounded-xs px-2 text-label-s whitespace-nowrap',
        PLAN_CLASSES[planKey],
      )}
    >
      {planKey === 'premium' && <Sparkles aria-hidden className="size-3.5" />}
      {name}
    </span>
  );
}
