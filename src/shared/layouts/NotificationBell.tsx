'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NotificationAudience } from '@/shared/api/notifications';
import { NotificationItem } from '@/shared/components/NotificationItem';
import { useLatestNotifications } from '@/shared/hooks/useLatestNotifications';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';

type NotificationBellProps = {
  audience: NotificationAudience;
  notificationsHref: string;
};

const MAXIMUM_SHOWN_COUNT = 9;

const TRIGGER_CLASSES =
  'relative inline-flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none';

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <span
      aria-hidden
      className="absolute top-1.5 right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] leading-none font-semibold text-fg-inverse"
    >
      {count > MAXIMUM_SHOWN_COUNT ? `${MAXIMUM_SHOWN_COUNT}+` : count}
    </span>
  );
}

// The bell in the panel header. On a desktop it opens the newest notices in
// place; on a telephone there is no room to anchor them, so it opens the page.
export function NotificationBell({ audience, notificationsHref }: NotificationBellProps) {
  const translate = useTranslations('common.notifications');
  const isDesktop = useIsDesktop();
  const notifications = useLatestNotifications();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const label =
    notifications.unread === 0
      ? translate('open')
      : translate('openWithUnread', { count: notifications.unread });

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsidePress(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  if (!isDesktop) {
    return (
      <Link href={notificationsHref} aria-label={label} className={TRIGGER_CLASSES}>
        <Bell aria-hidden className="size-5" />
        <UnreadBadge count={notifications.unread} />
      </Link>
    );
  }

  const items = notifications.latest?.items ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          setOpen((isOpen) => !isOpen);
          notifications.refresh();
        }}
        className={TRIGGER_CLASSES}
      >
        <Bell aria-hidden className="size-5" />
        <UnreadBadge count={notifications.unread} />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={translate('title')}
          className="absolute top-full right-0 z-40 mt-2 w-[24rem] overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-overlay"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-3">
            <h2 className="text-label-l text-fg">{translate('title')}</h2>
            {notifications.unread > 0 && (
              <button
                type="button"
                onClick={() => void notifications.markAllRead()}
                className="text-label-s text-fg-link hover:underline focus-visible:shadow-focus focus-visible:outline-none"
              >
                {translate('markAllRead')}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-body-m text-fg-secondary">
              {translate('empty')}
            </p>
          ) : (
            <ul className="max-h-[26rem] overflow-y-auto">
              {items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    audience={audience}
                    onOpen={(opened) => {
                      setOpen(false);
                      if (!opened.read) {
                        void notifications.markRead(opened.id);
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          )}

          <Link
            href={notificationsHref}
            onClick={() => setOpen(false)}
            className="block border-t border-line-subtle px-4 py-3 text-center text-label-m text-fg-link hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            {translate('seeAll')}
          </Link>
        </div>
      )}
    </div>
  );
}
