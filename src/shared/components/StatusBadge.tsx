export type StatusTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

const TONE_CLASSES: Record<StatusTone, { badge: string; dot: string }> = {
  info: { badge: 'bg-info-soft text-info', dot: 'bg-info' },
  warning: { badge: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  success: { badge: 'bg-success-soft text-success', dot: 'bg-success' },
  danger: { badge: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  neutral: { badge: 'bg-neutral-soft text-neutral', dot: 'bg-neutral' },
};

type StatusBadgeProps = {
  tone: StatusTone;
  label: string;
};

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-label-s ${classes.badge}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${classes.dot}`} />
      <span>{label}</span>
    </span>
  );
}
