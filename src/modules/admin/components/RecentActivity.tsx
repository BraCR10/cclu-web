'use client';

import { useTranslations } from 'next-intl';
import { NotificationItem } from '@/shared/components/NotificationItem';
import { useLatestNotifications } from '@/shared/hooks/useLatestNotifications';

// What happened lately, as the administrator's own notices tell it.
export function RecentActivity() {
  const translate = useTranslations('admin.summary.activity');
  const notifications = useLatestNotifications();
  const items = notifications.latest?.items ?? [];

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-line-subtle bg-surface py-4 shadow-raised lg:py-6">
      <h2 className="px-4 text-heading-m text-fg lg:px-6">{translate('title')}</h2>
      {items.length === 0 ? (
        <p className="px-4 text-body-m text-fg-secondary lg:px-6">{translate('none')}</p>
      ) : (
        <ul>
          {items.map((notification) => (
            <li key={notification.id}>
              <NotificationItem
                notification={notification}
                audience="admin"
                onOpen={(opened) => {
                  if (!opened.read) {
                    void notifications.markRead(opened.id);
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
