import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from '@/shared/auth/useSession';
import { ROLES } from '@/shared/auth/roles';
import { ApiError } from '@/shared/api/request';

const IDENTITY = {
  id: 'abc',
  role: ROLES.MEMBER,
  email: 'socio@cclu.cr',
  displayName: 'Panadería La Unión',
} as const;

describe('useSession', () => {
  it('starts out not knowing, rather than guessing anonymous', () => {
    const { result } = renderHook(() =>
      useSession(
        () => new Promise(() => {}),
        async () => {},
      ),
    );

    expect(result.current.status).toBe('loading');
    expect(result.current.identity).toBeNull();
  });

  it('takes the identity from the answer the API verified', async () => {
    const { result } = renderHook(() =>
      useSession(
        async () => IDENTITY,
        async () => {},
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(result.current.identity).toEqual(IDENTITY);
  });

  it('settles on anonymous when the session is gone', async () => {
    const { result } = renderHook(() =>
      useSession(
        async () => {
          throw new ApiError(401, 'Unauthorized');
        },
        async () => {},
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('anonymous'));
    expect(result.current.identity).toBeNull();
  });

  it('asks the API to clear the cookie, since nothing here can reach it', async () => {
    const closeSession = vi.fn(async () => {});
    const { result } = renderHook(() => useSession(async () => IDENTITY, closeSession));

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    await result.current.signOut();

    expect(closeSession).toHaveBeenCalledOnce();
    await waitFor(() => expect(result.current.status).toBe('anonymous'));
  });

  it('drops the session locally even when signing out fails on the way out', async () => {
    const { result } = renderHook(() =>
      useSession(
        async () => IDENTITY,
        async () => {
          throw new ApiError(500, 'Internal Server Error');
        },
      ),
    );

    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    await expect(result.current.signOut()).rejects.toBeInstanceOf(ApiError);

    await waitFor(() => expect(result.current.status).toBe('anonymous'));
  });
});
