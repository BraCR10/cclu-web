import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '@/shared/components/ProfileMenu';

// The trigger repeats the heading beside the initial, so assertions are scoped
// to the panel rather than to the whole screen.
async function openMenu() {
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Su cuenta' }));

  return within(screen.getByRole('menu'));
}

describe('ProfileMenu', () => {
  it('shows the name, the address and the role of somebody who has all three', async () => {
    render(
      <ProfileMenu
        displayName="Panadería Tres Ríos"
        email="socio@example.cr"
        roleLabel="Agremiado"
        onSignOut={vi.fn()}
      />,
    );

    const menu = await openMenu();

    expect(menu.getByText('Panadería Tres Ríos')).toBeTruthy();
    expect(menu.getByText('socio@example.cr')).toBeTruthy();
    expect(menu.getByText('Agremiado')).toBeTruthy();
  });

  // The API answers with the address where an account holds no name, so the two
  // arrive identical and printing both read like a mistake.
  it('never prints the address twice for somebody who has no name', async () => {
    render(
      <ProfileMenu
        displayName="admin@example.cr"
        email="admin@example.cr"
        roleLabel="Administrador"
        onSignOut={vi.fn()}
      />,
    );

    const menu = await openMenu();

    expect(menu.getAllByText('admin@example.cr')).toHaveLength(1);
  });

  // Collapsing the card to two lines hid the role along with the name. It says
  // the same three things either way, and a missing name is something somebody
  // can act on from the link below it.
  it('says all three things whether or not there is a name', async () => {
    render(
      <ProfileMenu
        displayName="admin@example.cr"
        email="admin@example.cr"
        roleLabel="Administrador"
        onSignOut={vi.fn()}
      />,
    );

    const menu = await openMenu();

    expect(menu.getByText('Sin nombre')).toBeTruthy();
    expect(menu.getByText('admin@example.cr')).toBeTruthy();
    expect(menu.getByText('Administrador')).toBeTruthy();
  });

  it('reads name, then address, then role', async () => {
    render(
      <ProfileMenu
        displayName="Ana Rojas"
        email="admin@example.cr"
        roleLabel="Administrador"
        onSignOut={vi.fn()}
      />,
    );

    const menu = await openMenu();
    const lines = Array.from(menu.getByText('Ana Rojas').parentElement?.children ?? []).map(
      (node) => node.textContent,
    );

    expect(lines).toEqual(['Ana Rojas', 'admin@example.cr', 'Administrador']);
  });
});
