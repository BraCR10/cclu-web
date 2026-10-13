import type { ReactNode } from 'react';
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from 'lucide-react';

export type AlertTone = 'info' | 'warning' | 'danger' | 'success';

const TONES: Record<AlertTone, { classes: string; icon: LucideIcon; interrupts: boolean }> = {
  info: { classes: 'border-info bg-info-soft text-info', icon: Info, interrupts: false },
  warning: {
    classes: 'border-warning bg-warning-soft text-warning',
    icon: TriangleAlert,
    interrupts: true,
  },
  danger: { classes: 'border-danger bg-danger-soft text-danger', icon: CircleX, interrupts: true },
  success: {
    classes: 'border-success bg-success-soft text-success',
    icon: CircleCheck,
    interrupts: false,
  },
};

type AlertProps = {
  tone: AlertTone;
  title: string;
  message?: ReactNode;
};

export function Alert({ tone, title, message }: AlertProps) {
  const { classes, icon: Icon, interrupts } = TONES[tone];

  return (
    <div
      role={interrupts ? 'alert' : 'status'}
      className={`flex gap-3 rounded-md border p-4 ${classes}`}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-display text-heading-s text-fg">{title}</p>
        {message && <div className="text-body-m text-fg-secondary">{message}</div>}
      </div>
    </div>
  );
}
