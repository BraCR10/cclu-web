'use client';

import { useTranslations } from 'next-intl';
import type { AppNotification, NotificationAudience } from '@/shared/api/notifications';
import { formatColones } from '@/shared/utils/formatColones';
import { useDates } from './useDates';

// Where a notice takes the person, by who reads it and what it is about.
const DESTINATIONS: Record<
  NotificationAudience,
  Partial<Record<AppNotification['type'], string>>
> = {
  admin: {
    application_submitted: '/admin/applications',
    application_resubmitted: '/admin/applications',
    payment_submitted: '/admin/payments',
    membership_expiring: '/admin/memberships',
  },
  member: {
    payment_approved: '/member/payments',
    payment_rejected: '/member/payments',
    membership_expiring: '/member/membership',
    membership_lapsed: '/member/membership',
  },
};

// The API names what happened; the sentence is written here, so the wording
// can change without touching a stored notice. The same event reads differently
// to the member it is about and to the panel.
export function useNotificationText(audience: NotificationAudience) {
  const translate = useTranslations(`common.notifications.${audience}`);
  const dates = useDates();

  return (notification: AppNotification) => {
    const { amount, validUntil, ...params } = notification.params;
    const values = {
      ...params,
      amount: typeof amount === 'number' ? formatColones(amount) : '',
      validUntil: typeof validUntil === 'string' ? dates.calendarDay(validUntil, 'short') : '',
    };

    return {
      text: translate.has(notification.type) ? translate(notification.type, values) : null,
      href: DESTINATIONS[audience][notification.type] ?? null,
    };
  };
}
