import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequireRole, PANEL_BY_ROLE } from '@/shared/auth/useRequireRole';
import { ROLES } from '@/shared/auth/roles';
import type { Session } from '@/shared/auth/useSession';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

function signedInAs(role: (typeof ROLES)[keyof typeof ROLES]): Session {
  return {
    status: 'authenticated',
    identity: { id: 'x', role, email: 'quien@example.cr', displayName: 'Quien' },
  };
}

function guard(session: Session, allow: (typeof ROLES)[keyof typeof ROLES][]) {
  const redirect = vi.fn();

  renderHook(() => useRequireRole(session, { allow, signInPath: '/login', redirect }));

  return redirect;
}

describe('useRequireRole', () => {
  it('leaves somebody who belongs there alone', () => {
    const redirect = guard(signedInAs(ROLES.MEMBER), [ROLES.MEMBER]);

    expect(redirect).not.toHaveBeenCalled();
  });

  // Hiding the contents in place left the rail and the header of a panel
  // somebody has no business being in on the screen, which reads like a way in.
  it('sends an administrator who reached the member panel to their own', () => {
    const redirect = guard(signedInAs(ROLES.ADMIN), [ROLES.MEMBER]);

    expect(redirect).toHaveBeenCalledWith(PANEL_BY_ROLE[ROLES.ADMIN]);
  });

  it('sends a member who reached the administrator panel to their own', () => {
    const redirect = guard(signedInAs(ROLES.MEMBER), [ROLES.ADMIN]);

    expect(redirect).toHaveBeenCalledWith(PANEL_BY_ROLE[ROLES.MEMBER]);
  });

  // Somebody with no session has nowhere of their own to be sent to.
  it('sends a session that expired to sign in rather than to a panel', () => {
    const redirect = guard({ status: 'anonymous', identity: null }, [ROLES.MEMBER]);

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('sends nobody anywhere while the session is still being read', () => {
    const redirect = guard({ status: 'loading', identity: null }, [ROLES.MEMBER]);

    expect(redirect).not.toHaveBeenCalled();
  });
});
