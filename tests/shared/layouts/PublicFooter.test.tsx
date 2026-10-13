import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { PublicFooter } from '@/shared/layouts/PublicFooter';
import { renderWithIntl } from '../../support/renderWithIntl';

function linkIn(groupName: string, linkName: string) {
  const group = screen.getByRole('navigation', { name: groupName });
  return within(group).getByRole('link', { name: linkName });
}

describe('PublicFooter', () => {
  it('sits in the contentinfo landmark', () => {
    renderWithIntl(<PublicFooter />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('links the logo to the home page', () => {
    renderWithIntl(<PublicFooter />);

    expect(
      screen.getByRole('link', { name: 'Cámara de Comercio de La Unión, inicio' }),
    ).toHaveAttribute('href', '/');
  });

  it('lets a visitor explore the public sections', () => {
    renderWithIntl(<PublicFooter />);

    expect(linkIn('Explorar', 'Directorio de comercios')).toHaveAttribute('href', '/directory');
    expect(linkIn('Explorar', 'Marketplace')).toHaveAttribute('href', '/marketplace');
    expect(linkIn('Explorar', 'Promociones')).toHaveAttribute('href', '/promotions');
    expect(linkIn('Explorar', 'Bolsa de empleo')).toHaveAttribute('href', '/jobs');
    expect(linkIn('Explorar', 'Planes de membresía')).toHaveAttribute('href', '/plans');
  });

  it('gathers what a member or a future member looks for', () => {
    renderWithIntl(<PublicFooter />);

    expect(linkIn('Agremiados', 'Afiliarse')).toHaveAttribute('href', '/register');
    expect(linkIn('Agremiados', 'Iniciar sesión')).toHaveAttribute('href', '/login');
    expect(linkIn('Agremiados', 'Descuentos para agremiados')).toHaveAttribute(
      'href',
      '/discounts',
    );
    expect(linkIn('Agremiados', 'Verificar un carné')).toHaveAttribute('href', '/verify-card');
  });

  it('offers every way to reach the chamber', () => {
    renderWithIntl(<PublicFooter />);

    expect(screen.getByRole('link', { name: 'WhatsApp 6128 2812' })).toHaveAttribute(
      'href',
      'https://wa.me/50661282812',
    );
    expect(screen.getByRole('link', { name: 'info@camaralaunion.com' })).toHaveAttribute(
      'href',
      'mailto:info@camaralaunion.com',
    );
    expect(screen.getByRole('link', { name: 'www.camaralaunion.com' })).toHaveAttribute(
      'href',
      'https://www.camaralaunion.com',
    );
    expect(screen.getByText('Tres Ríos, La Unión, Cartago')).toBeInTheDocument();
  });

  it('opens external destinations in a new tab without exposing this page', () => {
    renderWithIntl(<PublicFooter />);

    const whatsApp = screen.getByRole('link', { name: 'WhatsApp 6128 2812' });
    expect(whatsApp).toHaveAttribute('target', '_blank');
    expect(whatsApp).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links the chamber social profiles', () => {
    renderWithIntl(<PublicFooter />);

    const social = screen.getByRole('list', { name: 'Redes sociales' });
    const names = within(social)
      .getAllByRole('link')
      .map((link) => link.getAttribute('aria-label'));
    expect(names).toEqual([
      'Facebook de la Cámara',
      'Instagram de la Cámara',
      'LinkedIn de la Cámara',
    ]);
  });

  it('links the legal pages', () => {
    renderWithIntl(<PublicFooter />);

    expect(linkIn('Enlaces legales', 'Estatutos')).toHaveAttribute('href', '/bylaws');
    expect(linkIn('Enlaces legales', 'Términos del Marketplace')).toHaveAttribute('href', '/terms');
    expect(linkIn('Enlaces legales', 'Política de privacidad')).toHaveAttribute('href', '/privacy');
  });

  it('states the copyright for the current year', () => {
    renderWithIntl(<PublicFooter />);

    const year = new Date().getFullYear();
    expect(
      screen.getByText(
        `© ${year} Cámara de Comercio, Turismo, Industria y Afines del Cantón de La Unión`,
      ),
    ).toBeInTheDocument();
  });
});
