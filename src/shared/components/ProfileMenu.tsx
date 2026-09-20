'use client';

import Link from 'next/link';
import { Dropdown } from './Dropdown';
import { BadgeCheckIcon, ChevronDownIcon, SignOutIcon, UserIcon } from './icons';

export type ProfileLink = { href: string; label: string };

type ProfileMenuProps = {
  displayName: string;
  email: string;
  roleLabel: string;
  memberCode?: string | null;
  links?: ProfileLink[];
  onSignOut: () => void;
};

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function ProfileMenu({
  displayName,
  email,
  roleLabel,
  memberCode,
  links = [],
  onSignOut,
}: ProfileMenuProps) {
  return (
    <Dropdown
      label="Su cuenta"
      button={
        <>
          <span className="flex size-8 items-center justify-center rounded-pill bg-linear-to-br from-brand to-support text-sm font-semibold text-on-brand">
            {initial(displayName)}
          </span>
          <span className="hidden max-w-36 truncate font-medium sm:block">{displayName}</span>
          <ChevronDownIcon className="size-4 text-content-muted" />
        </>
      }
    >
      {(close) => (
        <>
          <div className="flex flex-col gap-1 border-b border-border p-4">
            <p className="font-medium">{displayName}</p>
            <p className="truncate text-sm text-content-muted">{email}</p>
            <p className="text-xs text-content-muted">{roleLabel}</p>
          </div>

          {memberCode !== undefined && memberCode !== null && (
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm">
              <BadgeCheckIcon className="size-4 text-support" />
              <span className="font-mono tabular-nums">{memberCode}</span>
            </div>
          )}

          <div className="p-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                role="menuitem"
                className="flex items-center gap-3 rounded-control px-3 py-2 text-sm transition-colors hover:bg-surface"
              >
                <UserIcon className="size-4 text-content-muted" />
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onSignOut();
              }}
              className="flex w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-colors hover:bg-surface"
            >
              <SignOutIcon className="size-4 text-content-muted" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </Dropdown>
  );
}
