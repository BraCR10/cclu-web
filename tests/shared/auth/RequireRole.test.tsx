import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import type { Session } from '@/shared/auth/useSession';

const AS_MEMBER: Session = {
  status: 'authenticated',
  identity: { id: 'abc', role: ROLES.MEMBER },
};

const AS_ADMIN: Session = {
  status: 'authenticated',
  identity: { id: 'xyz', role: ROLES.ADMIN },
};

describe('RequireRole', () => {
  it('hides an administrator area from someone signed in as a member', () => {
    render(
      <RequireRole session={AS_MEMBER} allow={[ROLES.ADMIN]}>
        <p>Panel administrativo</p>
      </RequireRole>,
    );

    expect(screen.queryByText('Panel administrativo')).toBeNull();
  });

  it('shows the area to the role it was opened for', () => {
    render(
      <RequireRole session={AS_ADMIN} allow={[ROLES.ADMIN]}>
        <p>Panel administrativo</p>
      </RequireRole>,
    );

    expect(screen.getByText('Panel administrativo')).toBeDefined();
  });

  it('accepts any one of several roles', () => {
    render(
      <RequireRole session={AS_MEMBER} allow={[ROLES.MEMBER, ROLES.ADMIN]}>
        <p>Carné digital</p>
      </RequireRole>,
    );

    expect(screen.getByText('Carné digital')).toBeDefined();
  });

  it('shows nothing while the session is still being read', () => {
    render(
      <RequireRole session={{ status: 'loading', identity: null }} allow={[ROLES.MEMBER]}>
        <p>Carné digital</p>
      </RequireRole>,
    );

    expect(screen.queryByText('Carné digital')).toBeNull();
  });

  it('shows the fallback instead of the area when there is one', () => {
    render(
      <RequireRole session={AS_MEMBER} allow={[ROLES.ADMIN]} fallback={<p>No disponible</p>}>
        <p>Panel administrativo</p>
      </RequireRole>,
    );

    expect(screen.getByText('No disponible')).toBeDefined();
    expect(screen.queryByText('Panel administrativo')).toBeNull();
  });
});
