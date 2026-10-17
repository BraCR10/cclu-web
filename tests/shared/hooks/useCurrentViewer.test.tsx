import { describe, it, expect } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useCurrentViewer } from '@/shared/hooks/useCurrentViewer';
import type { CurrentAccount } from '@/shared/api/currentAccount';
import { renderHookWithIntl } from '../../support/renderWithIntl';

const ACCOUNT: CurrentAccount = {
  id: '65f0c3a1b2c3d4e5f6a7b8c9',
  role: 'member',
  email: 'mariana@cafelomaverde.cr',
  displayName: 'Café Loma Verde',
  memberCode: 'MA7K2Q4',
};

describe('useCurrentViewer', () => {
  it('names the member the way the chamber does, with the code they are asked for', async () => {
    const { result } = renderHookWithIntl(() => useCurrentViewer(async () => ACCOUNT));

    await waitFor(() =>
      expect(result.current).toEqual({ name: 'Café Loma Verde', detail: 'Código MA7K2Q4' }),
    );
  });

  // An administrator has no member code, so the address stands in for it.
  it('falls back to the address for an account without a code', async () => {
    const { result } = renderHookWithIntl(() =>
      useCurrentViewer(async () => ({ ...ACCOUNT, role: 'admin', memberCode: null })),
    );

    await waitFor(() =>
      expect(result.current).toEqual({
        name: 'Café Loma Verde',
        detail: 'mariana@cafelomaverde.cr',
      }),
    );
  });

  // A session that already ended answers with a refusal, which is not something
  // to put in front of somebody: the menu simply greets nobody.
  it('greets nobody when the session is over', async () => {
    const { result } = renderHookWithIntl(() =>
      useCurrentViewer(async () => {
        throw new Error('refused');
      }),
    );

    await waitFor(() => expect(result.current).toBeUndefined());
  });
});
