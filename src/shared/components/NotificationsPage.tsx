'use client';

import { useTranslations } from 'next-intl';
import {
  markAllNotificationsRead,
  markNotificationRead,
  readNotifications,
  type NotificationAudience,
  type NotificationPage,
} from '@/shared/api/notifications';
import { usePagedList, type PagedQuery } from '@/shared/hooks/usePagedList';
import { Button } from './Button';
import { NotificationItem } from './NotificationItem';
import { PagedList } from './PagedList';

const PAGE_SIZE = 10;

function readNotificationPage({ page }: PagedQuery<object>) {
  return readNotifications(page, PAGE_SIZE);
}

// M-00 and A-00 in full: every notice of the person, newest first.
export function NotificationsPage({ audience }: { audience: NotificationAudience }) {
  const translate = useTranslations('common.notifications');
  const notifications = usePagedList<object, NotificationPage>(readNotificationPage, {});
  const { list } = notifications;

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-8 lg:py-8">
      {list !== null && list.unread > 0 && (
        <div>
          <Button
            variant="ghost"
            size="s"
            onClick={() => void markAllNotificationsRead().then(notifications.reload)}
          >
            {translate('markAllRead')}
          </Button>
        </div>
      )}

      <PagedList
        list={list}
        loading={notifications.loading}
        failed={notifications.failed}
        emptyMessage={translate('empty')}
        onPageChange={notifications.showPage}
      >
        <ul
          aria-label={translate('title')}
          className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised"
        >
          {(list?.items ?? []).map((notification) => (
            <li key={notification.id}>
              <NotificationItem
                notification={notification}
                audience={audience}
                onOpen={(opened) => {
                  if (!opened.read) {
                    void markNotificationRead(opened.id).catch(() => {});
                  }
                }}
              />
            </li>
          ))}
        </ul>
      </PagedList>
    </div>
  );
}
