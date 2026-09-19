import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { ROLES } from '@/shared/auth/roles';
import type { Session } from '@/shared/auth/useSession';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

const AUTHENTICATED: Session = {
  status: 'authenticated',
  identity: { id: 'abc', role: ROLES.AGREMIADO },
};

describe('useRequireSession', () => {
  it('sends the person to sign in once the session has expired', () => {
    const redirect = vi.fn();

    renderHook(() => useRequireSession({ status: 'anonymous', identity: null }, redirect));

    expect(redirect).toHaveBeenCalledWith(SIGN_IN_PATH);
  });

  it('leaves a working session where it is', () => {
    const redirect = vi.fn();

    renderHook(() => useRequireSession(AUTHENTICATED, redirect));

    expect(redirect).not.toHaveBeenCalled();
  });

  it('waits for the answer instead of redirecting while it is still loading', () => {
    const redirect = vi.fn();

    renderHook(() => useRequireSession({ status: 'loading', identity: null }, redirect));

    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects once, not on every render', () => {
    const redirect = vi.fn();
    const { rerender } = renderHook(() =>
      useRequireSession({ status: 'anonymous', identity: null }, redirect),
    );

    rerender();
    rerender();

    expect(redirect).toHaveBeenCalledOnce();
  });
});
