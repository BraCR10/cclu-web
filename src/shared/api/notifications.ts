import { requestApi } from './apiClient';
import { pageQuery, type Paginated } from './pagination';

export type NotificationType =
  | 'application_submitted'
  | 'application_resubmitted'
  | 'payment_submitted'
  | 'payment_approved'
  | 'payment_rejected'
  | 'membership_expiring'
  | 'membership_lapsed';

export type NotificationAudience = 'member' | 'admin';

export type AppNotification = {
  id: string;
  type: NotificationType;
  params: Record<string, string | number>;
  read: boolean;
  createdAt: string;
};

export type NotificationPage = Paginated<AppNotification> & { unread: number };

export function readNotifications(page: number, pageSize: number) {
  return requestApi<NotificationPage>(`/api/notifications?${pageQuery(page, pageSize)}`);
}

export function markNotificationRead(notificationId: string) {
  return requestApi<void>(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'POST',
  });
}

export function markAllNotificationsRead() {
  return requestApi<void>('/api/notifications/read', { method: 'POST' });
}
