'use client';

import Link from 'next/link';
import { Dropdown } from './Dropdown';
import { BellIcon } from './icons';

export type Notice = {
  id: string;
  title: string;
  detail?: string;
  href?: string;
};

type NotificationsMenuProps = {
  notices: Notice[];
  emptyMessage: string;
};

export function NotificationsMenu({ notices, emptyMessage }: NotificationsMenuProps) {
  const count = notices.length;

  return (
    <Dropdown
      label={count === 0 ? 'Avisos' : `Avisos, ${count} sin atender`}
      button={
        <span className="relative flex size-8 items-center justify-center">
          <BellIcon className="size-5 text-content-muted" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-pill bg-brand px-1 text-[0.625rem] font-semibold text-on-brand tabular-nums">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </span>
      }
    >
      {(close) => (
        <>
          <p className="border-b border-border px-4 py-3 text-sm font-medium">Avisos</p>

          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-content-muted">{emptyMessage}</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-2">
              {notices.map((notice) => {
                const content = (
                  <>
                    <span className="mt-1.5 size-2 shrink-0 rounded-pill bg-brand" />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{notice.title}</span>
                      {notice.detail !== undefined && (
                        <span className="text-xs text-content-muted">{notice.detail}</span>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={notice.id}>
                    {notice.href === undefined ? (
                      <span className="flex gap-3 rounded-control px-3 py-2">{content}</span>
                    ) : (
                      <Link
                        href={notice.href}
                        onClick={close}
                        role="menuitem"
                        className="flex gap-3 rounded-control px-3 py-2 transition-colors hover:bg-surface"
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Dropdown>
  );
}
