import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { House, IdCard, User } from 'lucide-react';
import { BottomNav } from '@/shared/layouts/BottomNav';
import { renderWithIntl } from '../../support/renderWithIntl';

vi.mock('next/navigation', () => ({ usePathname: () => '/member/card' }));

const items = [
  { id: 'home', labelKey: 'member.nav.home', href: '/member', icon: House },
  { id: 'card', labelKey: 'member.bottomNav.card', href: '/member/card', icon: IdCard },
] as const;

const moreGroups = [
  {
    id: 'account',
    items: [{ id: 'profile', labelKey: 'member.nav.profile', href: '/member/profile', icon: User }],
  },
] as const;

describe('BottomNav', () => {
  it('marks the current page among its links', () => {
    renderWithIntl(<BottomNav label="Navegación" items={items} moreGroups={moreGroups} />);

    expect(screen.getByRole('link', { name: 'Carné' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('raises the Más sheet with the remaining options', async () => {
    renderWithIntl(<BottomNav label="Navegación" items={items} moreGroups={moreGroups} />);

    await userEvent.click(screen.getByRole('button', { name: 'Más' }));

    const sheet = screen.getByRole('dialog', { name: 'Más opciones' });
    expect(sheet).toHaveAttribute('data-presentation', 'sheet');
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute(
      'href',
      '/member/profile',
    );
  });

  it('closes the sheet when one of its options is followed', async () => {
    renderWithIntl(<BottomNav label="Navegación" items={items} moreGroups={moreGroups} />);

    await userEvent.click(screen.getByRole('button', { name: 'Más' }));
    await userEvent.click(screen.getByRole('link', { name: 'Mi perfil' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('gives every tab a touch target of at least 44 px', () => {
    renderWithIntl(<BottomNav label="Navegación" items={items} moreGroups={moreGroups} />);

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveClass('min-h-14');
  });
});
