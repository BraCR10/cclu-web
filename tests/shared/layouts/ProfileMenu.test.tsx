import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '@/shared/layouts/ProfileMenu';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

function renderMenu() {
  viewportIsDesktop(true);

  renderWithIntl(
    <>
      <ProfileMenu
        viewer={{ name: 'Mariana Solís', detail: 'Café Loma Verde' }}
        profileHref="/member/profile"
      />
      <p>Fuera</p>
    </>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ProfileMenu', () => {
  it('opens the short profile menu from the avatar', async () => {
    renderMenu();

    const trigger = screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toHaveAttribute(
      'href',
      '/member/profile',
    );
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('moves into the menu and between items with the arrow keys', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' }));

    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toHaveFocus();
  });

  it('closes with Escape and gives the focus back to the avatar', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes when the page around it is clicked', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' }));
    await userEvent.click(screen.getByText('Fuera'));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('names who is signed in when it knows', async () => {
    renderMenu();

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' }));

    expect(screen.getByRole('menu')).toHaveTextContent('Mariana Solís');
    expect(screen.getByRole('menu')).toHaveTextContent('Café Loma Verde');
  });

  // The panel is the same one for both audiences, and so is the way out of it.
  it('signs an administrator out through the same address', async () => {
    viewportIsDesktop(true);
    renderWithIntl(<ProfileMenu profileHref="/admin/profile" />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' }));

    expect(screen.getByRole('menuitem', { name: 'Mi perfil' })).toHaveAttribute(
      'href',
      '/admin/profile',
    );
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toHaveAttribute(
      'href',
      '/logout',
    );
  });

  // On a telephone the same items arrive as a sheet named after the account: a
  // menu pinned to the corner is both hard to reach and easy to miss.
  it('is a sheet named after the account on a telephone', async () => {
    viewportIsDesktop(false);
    renderWithIntl(
      <ProfileMenu
        viewer={{ name: 'Mariana Solís', detail: 'Café Loma Verde' }}
        profileHref="/member/profile"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Abrir el menú de tu cuenta' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Mi cuenta');
    expect(screen.getByText('Cerrar sesión').closest('a')).toHaveAttribute('href', '/logout');
  });
});
