import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { PanelShell } from '@/shared/layouts/PanelShell';
import { memberNavigation } from '@/shared/layouts/memberNavigation';
import { adminNavigation } from '@/shared/layouts/adminNavigation';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

let pathname = '/member/payments';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

// The shell draws the profile menu, and the menu asks which screen it is on.
beforeEach(() => {
  viewportIsDesktop(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PanelShell', () => {
  it('gives the member panel its sidebar, with the current page marked', () => {
    pathname = '/member/payments';
    renderWithIntl(<PanelShell navigation={memberNavigation}>Contenido</PanelShell>);

    const sidebar = screen.getByRole('navigation', { name: 'Panel del agremiado' });
    expect(within(sidebar).getByRole('link', { name: 'Pagos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sidebar).getByRole('link', { name: 'Mis vacantes' })).toBeInTheDocument();
  });

  it('titles the page after the section it is in', () => {
    pathname = '/member/payments';
    renderWithIntl(<PanelShell navigation={memberNavigation}>Contenido</PanelShell>);

    expect(screen.getByRole('heading', { level: 1, name: 'Pagos' })).toBeInTheDocument();
  });

  it('renders the page inside the main landmark', () => {
    renderWithIntl(<PanelShell navigation={memberNavigation}>Contenido</PanelShell>);

    expect(screen.getByRole('main')).toHaveTextContent('Contenido');
  });

  it('groups the administration sidebar under its headings', () => {
    pathname = '/admin';
    renderWithIntl(<PanelShell navigation={adminNavigation}>Contenido</PanelShell>);

    const sidebar = screen.getByRole('navigation', { name: 'Administración' });
    expect(within(sidebar).getByText('Herramientas')).toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Resumen' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('offers the mobile bottom nav with Más', () => {
    renderWithIntl(<PanelShell navigation={adminNavigation}>Contenido</PanelShell>);

    expect(screen.getByRole('button', { name: 'Más' })).toBeInTheDocument();
  });
});
