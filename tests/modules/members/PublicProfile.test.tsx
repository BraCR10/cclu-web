import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicProfile } from '@/modules/members/components/PublicProfile';
import type { PublicProfile as Profile } from '@/modules/members/api/directory';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    memberCode: 'M-A7K2-Q4',
    businessName: 'Panadería Tres Ríos',
    businessDescription: 'Panadería artesanal con horno de leña.',
    memberType: 'business',
    sector: 'Alimentos y bebidas',
    canton: 'La Unión',
    province: 'Cartago',
    location: 'Frente al parque central',
    phone: '22791234',
    whatsappNumber: '87654321',
    instagram: '@panaderiatresrios',
    facebook: null,
    linkedin: null,
    website: 'https://panaderiatresrios.cr',
    logoUrl: null,
    affiliatedSince: '2026-03-04T12:00:00.000Z',
    ...overrides,
  };
}

describe('PublicProfile', () => {
  it('presents the business to whoever scanned the card', async () => {
    render(<PublicProfile memberCode="MA7K2Q4" loadProfile={async () => profile()} />);

    expect(await screen.findByText('Panadería Tres Ríos')).toBeTruthy();
    expect(screen.getByText('Afiliado a la Cámara')).toBeTruthy();
    expect(screen.getByText('22791234')).toBeTruthy();
    expect(screen.getByText('M-A7K2-Q4')).toBeTruthy();
  });

  // Stored as free text, so they may be a handle rather than an address.
  it('shows a social account as text, never as a link', async () => {
    render(<PublicProfile memberCode="MA7K2Q4" loadProfile={async () => profile()} />);

    await screen.findByText('Panadería Tres Ríos');

    const links = screen.getAllByRole('link').map((link) => link.getAttribute('href'));

    expect(links).toEqual(['https://panaderiatresrios.cr']);
    expect(screen.getByText('@panaderiatresrios')).toBeTruthy();
  });

  it('says plainly that a code matches nobody, rather than showing nothing', async () => {
    render(
      <PublicProfile
        memberCode="MZZZZZZ"
        loadProfile={async () => {
          throw new Error('404');
        }}
      />,
    );

    expect(await screen.findByText('Ese código no corresponde a un afiliado')).toBeTruthy();
  });

  it('leaves out a field the business did not fill', async () => {
    render(
      <PublicProfile
        memberCode="MA7K2Q4"
        loadProfile={async () => profile({ whatsappNumber: null, website: null, instagram: null })}
      />,
    );

    await screen.findByText('Panadería Tres Ríos');

    expect(screen.queryByText('WhatsApp')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Sitio web' })).toBeNull();
  });
});
