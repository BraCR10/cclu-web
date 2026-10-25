'use client';

import Link from 'next/link';
import {
  Bell,
  CircleCheck,
  CircleX,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  FileCheck,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { useFormatter, useNow } from 'next-intl';
import type {
  AppNotification,
  NotificationAudience,
  NotificationType,
} from '@/shared/api/notifications';
import { useNotificationText } from '@/shared/hooks/useNotificationText';
import { classNames } from '@/shared/utils/classNames';

const ICONS: Record<NotificationType, LucideIcon> = {
  application_submitted: ClipboardList,
  application_resubmitted: FileCheck,
  payment_submitted: Receipt,
  payment_approved: CircleCheck,
  payment_rejected: CircleX,
  membership_expiring: Clock,
  membership_lapsed: Clock,
  publication_taken_down: EyeOff,
  publication_restored: Eye,
  vacancy_taken_down: EyeOff,
  vacancy_restored: Eye,
};

type NotificationItemProps = {
  notification: AppNotification;
  audience: NotificationAudience;
  onOpen: (notification: AppNotification) => void;
};

// Opening a notice marks it read and leads to what it is about.
export function NotificationItem({ notification, audience, onOpen }: NotificationItemProps) {
  const describe = useNotificationText(audience);
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const { text, href } = describe(notification);
  const Icon = ICONS[notification.type] ?? Bell;

  if (text === null) {
    return null;
  }

  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-union-soft text-fg-brand">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span
          className={classNames('text-body-m', notification.read ? 'text-fg-secondary' : 'text-fg')}
        >
          {text}
        </span>
        <span className="text-caption text-fg-muted">
          {format.relativeTime(new Date(notification.createdAt), now)}
        </span>
      </span>
      {!notification.read && (
        <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </>
  );

  const classes = classNames(
    'flex w-full gap-3 px-4 py-3 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none',
    !notification.read && 'bg-surface-subtle',
  );

  return href === null ? (
    <button type="button" onClick={() => onOpen(notification)} className={classes}>
      {content}
    </button>
  ) : (
    <Link href={href} onClick={() => onOpen(notification)} className={classes}>
      {content}
    </Link>
  );
}
