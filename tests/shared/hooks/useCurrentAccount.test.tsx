import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrentAccount } from '@/shared/hooks/useCurrentAccount';
import type { CurrentAccount } from '@/shared/api/currentAccount';

const admin: CurrentAccount = {
  id: 'a1',
  role: 'admin',
  email: 'mariana@camaralaunion.cr',
  displayName: 'Mariana Solís',
};

describe('useCurrentAccount', () => {
  it('starts loading and then names who is signed in, role included', async () => {
    const { result } = renderHook(() => useCurrentAccount(async () => admin));

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(result.current).toEqual({ status: 'ready', account: admin });
  });

  it('a session that turned out to be over answers unknown rather than failing', async () => {
    const { result } = renderHook(() =>
      useCurrentAccount(async () => {
        throw { status: 401, code: 'authentication_required' };
      }),
    );

    await waitFor(() => expect(result.current.status).toBe('unknown'));

    expect(result.current).toEqual({ status: 'unknown' });
  });
});
