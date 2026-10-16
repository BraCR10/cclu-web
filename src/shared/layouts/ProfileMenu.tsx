'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/components/Avatar';
import { BottomSheet } from '@/shared/components/BottomSheet';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { classNames } from '@/shared/utils/classNames';

export type Viewer = { name: string; detail?: string };

type ProfileMenuProps = {
  viewer?: Viewer;
  profileHref: string;
  signOutHref?: string;
};

const ITEM_CLASSES =
  'flex min-h-11 items-center gap-2 rounded-xs px-3 text-body-m hover:bg-surface-hover focus:bg-surface-hover focus:outline-none lg:min-h-9';

const SHEET_ITEM_CLASSES =
  'flex min-h-12 items-center gap-3 rounded-md px-3 text-body-l hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none';

// The one thing this menu always offers: the way out. Signing out needs no
// session, so the address is a page of its own that posts and comes back to the
// home page, which also covers a session that already ended.
export function ProfileMenu({ viewer, profileHref, signOutHref = '/logout' }: ProfileMenuProps) {
  const translate = useTranslations('common.shell');
  const isDesktop = useIsDesktop();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // The popup is a menu, so it moves focus into itself and keeps it there with
  // the arrow keys. The sheet hands both jobs to the behaviour every other sheet
  // already uses.
  useEffect(() => {
    if (!open || !isDesktop) {
      return;
    }

    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function closeOnOutsidePress(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsidePress);
    return () => document.removeEventListener('mousedown', closeOnOutsidePress);
  }, [open, isDesktop]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const targets: Record<string, number> = {
      ArrowDown: (current + 1) % items.length,
      ArrowUp: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key in targets) {
      event.preventDefault();
      items[targets[event.key]]?.focus();
    }
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-label={translate('openProfileMenu')}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={() => setOpen((isOpen) => !isOpen)}
      className="flex min-h-11 items-center gap-2 rounded-md px-1 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:px-2"
    >
      {viewer ? (
        <Avatar name={viewer.name} size="s" />
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-sm bg-brand-union-soft text-fg-brand">
          <User aria-hidden className="size-4" />
        </span>
      )}
      {viewer && (
        <span className="hidden flex-col items-start lg:flex">
          <span className="text-label-m text-fg">{viewer.name}</span>
          {viewer.detail && <span className="text-caption text-fg-muted">{viewer.detail}</span>}
        </span>
      )}
      <ChevronDown aria-hidden className="hidden size-4 text-fg-muted lg:block" />
    </button>
  );

  const account: ReactNode =
    viewer === undefined ? null : (
      <div className="flex items-center gap-3 px-1 pb-2">
        <Avatar name={viewer.name} size="m" />
        <span className="min-w-0">
          <span className="block truncate text-body-l text-fg">{viewer.name}</span>
          {viewer.detail && (
            <span className="block truncate text-body-s text-fg-muted">{viewer.detail}</span>
          )}
        </span>
      </div>
    );

  // Nothing to anchor a small menu to on a phone, and a menu in the corner is
  // hard to reach, so the same items arrive as a sheet named after the account.
  if (!isDesktop) {
    return (
      <div ref={containerRef} className="relative">
        {trigger}
        <BottomSheet open={open} title={translate('myAccount')} onClose={close}>
          {account}
          <Link
            href={profileHref}
            onClick={close}
            className={classNames(SHEET_ITEM_CLASSES, 'text-fg')}
          >
            <User aria-hidden className="size-5 text-fg-secondary" />
            <span className="flex-1">{translate('myProfile')}</span>
            <ChevronRight aria-hidden className="size-5 text-fg-muted" />
          </Link>
          <Link
            href={signOutHref}
            onClick={close}
            className={classNames(SHEET_ITEM_CLASSES, 'text-danger')}
          >
            <LogOut aria-hidden className="size-5" />
            <span className="flex-1">{translate('signOut')}</span>
          </Link>
        </BottomSheet>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {trigger}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={translate('openProfileMenu')}
          onKeyDown={moveFocus}
          className="absolute top-full right-0 z-50 mt-2 flex w-60 flex-col rounded-md border border-line-subtle bg-surface p-1 shadow-overlay"
        >
          {viewer && (
            <div role="none" className="px-3 py-2">
              <p className="text-label-m text-fg">{viewer.name}</p>
              {viewer.detail && <p className="text-caption text-fg-muted">{viewer.detail}</p>}
            </div>
          )}
          <Link
            role="menuitem"
            href={profileHref}
            onClick={close}
            className={`${ITEM_CLASSES} text-fg`}
          >
            <User aria-hidden className="size-4" />
            {translate('myProfile')}
          </Link>
          <div role="separator" className="my-1 h-px bg-line-subtle" />
          <Link
            role="menuitem"
            href={signOutHref}
            onClick={close}
            className={`${ITEM_CLASSES} text-danger`}
          >
            <LogOut aria-hidden className="size-4" />
            {translate('signOut')}
          </Link>
        </div>
      )}
    </div>
  );
}
