import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { PublicShell } from '@/shared/layouts/PublicShell';
import { renderWithIntl } from '../../support/renderWithIntl';

vi.mock('next/navigation', () => ({ usePathname: () => '/directory' }));

describe('PublicShell', () => {
  it('offers the public sections in its header, with the current one marked', () => {
    renderWithIntl(<PublicShell>Contenido</PublicShell>);

    const header = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(within(header).getByRole('link', { name: 'Directorio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(header).getByRole('link', { name: 'Bolsa de empleo' })).toBeInTheDocument();
  });

  it('links a visitor to signing in and joining', () => {
    renderWithIntl(<PublicShell>Contenido</PublicShell>);

    expect(screen.getAllByRole('link', { name: 'Iniciar sesión' })[0]).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getAllByRole('link', { name: 'Afiliarse' })[0]).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('links the logo to the home page', () => {
    renderWithIntl(<PublicShell>Contenido</PublicShell>);

    expect(
      screen.getAllByRole('link', { name: 'Cámara de Comercio de La Unión, inicio' })[0],
    ).toHaveAttribute('href', '/');
  });

  it('renders the page inside the main landmark', () => {
    renderWithIntl(<PublicShell>Contenido</PublicShell>);

    expect(screen.getByRole('main')).toHaveTextContent('Contenido');
  });
});
