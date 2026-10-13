import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '@/shared/layouts/ProfileMenu';
import { renderWithIntl } from '../../support/renderWithIntl';

function renderMenu() {
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
});
