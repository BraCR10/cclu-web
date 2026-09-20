import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminProfile } from '@/modules/admin/components/AdminProfile';
import { MESSAGES, messageForFieldCode } from '@/shared/config/messages';

function profile(overrides = {}) {
  return {
    id: 'a1',
    name: 'Ana Rojas',
    email: 'admin@example.cr',
    accountStatus: 'active',
    ...overrides,
  };
}

function renderProfile(overrides: Partial<Parameters<typeof AdminProfile>[0]> = {}) {
  const saveName = overrides.saveName ?? vi.fn(async (name: string) => profile({ name }));

  render(
    <AdminProfile
      loadProfile={overrides.loadProfile ?? (async () => profile())}
      saveName={saveName}
    />,
  );

  return { saveName, user: userEvent.setup() };
}

function save(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Guardar' }));
}

describe('AdminProfile', () => {
  it('shows the name, the address and the role', async () => {
    renderProfile();

    expect(await screen.findByDisplayValue('Ana Rojas')).toBeTruthy();
    expect(screen.getByText('admin@example.cr')).toBeTruthy();
    expect(screen.getByText('Administrador')).toBeTruthy();
  });

  // Read out in the order somebody would say them: who they are, where the
  // chamber writes to them, what they may do.
  it('reads name, then address, then role', async () => {
    const { container } = render(
      <AdminProfile loadProfile={async () => profile()} saveName={vi.fn()} />,
    );

    await screen.findByDisplayValue('Ana Rojas');

    // Scoped to the account card: the password section below it has a field of
    // its own and is not part of this list.
    const card = container.querySelector('section') as HTMLElement;
    const labels = Array.from(card.querySelectorAll('label, dt')).map((node) => node.textContent);

    expect(labels).toEqual(['Nombre', 'Correo', 'Rol']);
  });

  // The chamber decides who is an administrator and at what address. Offering
  // a field for either would suggest otherwise.
  it('shows what the chamber decides as read only, never as a field', async () => {
    renderProfile();

    await screen.findByDisplayValue('Ana Rojas');

    expect(screen.queryByLabelText('Correo')).toBeNull();
    expect(screen.queryByLabelText('Rol')).toBeNull();
  });

  it('sends only the name, and only once it changed', async () => {
    const { saveName, user } = renderProfile();

    const field = await screen.findByDisplayValue('Ana Rojas');

    await save(user);
    expect(saveName).not.toHaveBeenCalled();
    expect(await screen.findByText(MESSAGES.nothing_to_change)).toBeTruthy();

    await user.clear(field);
    await user.type(field, 'Ana Rojas Mora');
    await save(user);

    await waitFor(() => expect(saveName).toHaveBeenCalledWith('Ana Rojas Mora'));
  });

  it('says the name is missing rather than saving an account nobody can be greeted by', async () => {
    const { saveName, user } = renderProfile();

    await user.clear(await screen.findByDisplayValue('Ana Rojas'));
    await save(user);

    await waitFor(() =>
      expect(document.getElementById('name-error')?.textContent).toContain(MESSAGES.required),
    );
    expect(saveName).not.toHaveBeenCalled();
  });

  it('refuses a name longer than the rules allow without asking the server', async () => {
    const { saveName, user } = renderProfile();

    const field = await screen.findByDisplayValue('Ana Rojas');

    await user.clear(field);
    await user.type(field, 'a'.repeat(121));
    await save(user);

    await waitFor(() =>
      expect(document.getElementById('name-error')?.textContent).toContain(
        messageForFieldCode('name', 'too_long'),
      ),
    );
    expect(saveName).not.toHaveBeenCalled();
  });

  // Administrators created before names existed have none, and the screen has
  // to open for them so they can set one.
  it('opens with an empty field for an account that never had a name', async () => {
    renderProfile({ loadProfile: async () => profile({ name: null }) });

    await waitFor(() =>
      expect((screen.getByLabelText(/Nombre/) as HTMLInputElement).value).toBe(''),
    );
  });
});
