'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  markAllNotificationsRead,
  markNotificationRead,
  readNotifications,
  type NotificationPage,
} from '@/shared/api/notifications';

const LATEST_COUNT = 5;
// Often enough that a new payment shows while the panel is open, rarely enough
// that an idle tab costs nothing.
const REFRESH_IN_MILLISECONDS = 60_000;

// The few newest notices and how many are unread, for the bell. A refresh that
// fails keeps what is on screen: the bell is a hint, not the record.
export function useLatestNotifications() {
  const [latest, setLatest] = useState<NotificationPage | null>(null);

  const refresh = useCallback(() => {
    readNotifications(1, LATEST_COUNT)
      .then(setLatest)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_IN_MILLISECONDS);

    return () => clearInterval(timer);
  }, [refresh]);

  return {
    latest,
    unread: latest?.unread ?? 0,
    refresh,
    markRead: (notificationId: string) =>
      markNotificationRead(notificationId).then(refresh, () => {}),
    markAllRead: () => markAllNotificationsRead().then(refresh, () => {}),
  };
}
