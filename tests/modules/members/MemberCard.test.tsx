import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemberCard } from '@/modules/members/components/MemberCard';
import type { MemberProfile } from '@/modules/members/api/profile';

function profile(overrides: Partial<MemberProfile> = {}): MemberProfile {
  return {
    _id: 'm1',
    email: 'socio@example.cr',
    phone: '88880000',
    location: 'Centro',
    businessName: 'Panadería Tres Ríos',
    businessDescription: 'Panadería artesanal.',
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3101456789',
    memberCode: 'MA7K2Q4',
    createdAt: '2026-03-04T12:00:00.000Z',
    state: 'active',
    canton: { _id: 'c1', name: 'La Unión', province: 'Cartago' },
    sector: { _id: 's1', name: 'Alimentos y bebidas' },
    ...overrides,
  };
}

function renderCard(overrides: Parameters<typeof MemberCard>[0] = {}) {
  render(
    <MemberCard
      loadProfile={overrides.loadProfile ?? (async () => profile())}
      originOf={overrides.originOf ?? (() => 'https://cclu.cr')}
    />,
  );
}

describe('MemberCard', () => {
  it('shows the code grouped and the address the camera will read', async () => {
    renderCard();

    expect(await screen.findByText('M-A7K2-Q4')).toBeTruthy();
    expect(screen.getByText('https://cclu.cr/directory/MA7K2Q4')).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
  });

  // The card is the proof of an approved affiliation, so it cannot exist before
  // there is one.
  it('does not exist while the registration is still being decided', async () => {
    renderCard({
      loadProfile: async () => profile({ state: 'under_review', memberCode: null }),
    });

    expect(await screen.findByText('Su carné todavía no existe')).toBeTruthy();
    expect(screen.queryByText('M-A7K2-Q4')).toBeNull();
  });

  it('does not exist for a suspended affiliation either', async () => {
    renderCard({ loadProfile: async () => profile({ state: 'suspended' }) });

    expect(await screen.findByText('Su carné todavía no existe')).toBeTruthy();
  });

  it('reports a profile it could not read instead of an empty card', async () => {
    renderCard({
      loadProfile: async () => {
        throw new Error('network');
      },
    });

    expect((await screen.findByRole('alert')).textContent).toContain('No fue posible cargar');
  });
});
