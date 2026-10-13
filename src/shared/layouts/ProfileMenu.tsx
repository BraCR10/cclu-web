'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/components/Avatar';

export type Viewer = { name: string; detail?: string };

type ProfileMenuProps = {
  viewer?: Viewer;
  profileHref: string;
  signOutHref?: string;
};

const ITEM_CLASSES =
  'flex min-h-11 items-center gap-2 rounded-xs px-3 text-body-m hover:bg-surface-hover focus:bg-surface-hover focus:outline-none lg:min-h-9';

export function ProfileMenu({ viewer, profileHref, signOutHref = '/logout' }: ProfileMenuProps) {
  const translate = useTranslations('common.shell');
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
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
  }, [open]);

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

  return (
    <div ref={containerRef} className="relative">
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
