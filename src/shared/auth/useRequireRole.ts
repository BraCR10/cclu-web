'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, type Role } from './roles';
import type { Session } from './useSession';
import { useRequireSession } from './useRequireSession';

// Where each role belongs. Somebody who reached the wrong panel is sent to
// their own rather than to a refusal, because they have somewhere to be.
export const PANEL_BY_ROLE: Record<Role, string> = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.MEMBER]: '/member',
};

type RequireRoleOptions = {
  allow: Role[];
  signInPath?: string;
  redirect?: (path: string) => void;
};

// An expired session is sent to sign in; a session belonging to the other role
// is sent to its own panel. Hiding the contents in place, which is what the
// component does, left the rail and the header of a panel somebody has no
// business being in on the screen, and that reads like a way in.
//
// Neither is protection. The API refuses by role on every route, and that is
// the answer that counts.
export function useRequireRole(session: Session, options: RequireRoleOptions): void {
  const router = useRouter();
  const goTo = options.redirect ?? ((path: string) => router.replace(path));
  const allowed = options.allow.join(',');
  const role = session.status === 'authenticated' ? session.identity.role : null;

  useRequireSession(session, { signInPath: options.signInPath, redirect: options.redirect });

  useEffect(() => {
    if (role === null || allowed.split(',').includes(role)) {
      return;
    }

    goTo(PANEL_BY_ROLE[role] ?? '/');
    // The destination depends on the role and what is allowed, and on nothing
    // that is rebuilt on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, allowed]);
}
