import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyListingsPanel } from '@/modules/marketplace/components/MyListingsPanel';
import type { Listing } from '@/modules/marketplace/api/listings';

function listing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 'l1',
    title: 'Pan artesanal',
    description: 'Pan de masa madre horneado a diario.',
    price: 2500,
    category: 'Alimentos',
    imageUrl: null,
    isActive: true,
    createdAt: '2026-03-04T12:00:00.000Z',
    business: null,
    ...overrides,
  };
}

const paidMembership = {
  type: 'paid' as const,
  paidUntil: '2026-12-31T00:00:00.000Z',
  feeAmount: 15000,
  benefits: { free: [], paid: [] },
};
const loadPaid = async () => paidMembership;

describe('MyListingsPanel', () => {
  it('lists the listings it is given', async () => {
    render(<MyListingsPanel loadMembership={loadPaid} loadListings={async () => [listing()]} />);

    expect(await screen.findByText('Pan artesanal')).toBeTruthy();
    expect(screen.getByText(/Activa/)).toBeTruthy();
  });

  it('says so when there is nothing published yet', async () => {
    render(<MyListingsPanel loadMembership={loadPaid} loadListings={async () => []} />);

    expect(await screen.findByText(/Todavía no ha publicado nada/)).toBeTruthy();
  });

  it('reports a list it could not load', async () => {
    render(
      <MyListingsPanel
        loadListings={async () => {
          throw new Error('network');
        }}
      />,
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('offers no closing action for a listing already retired', async () => {
    render(
      <MyListingsPanel
        loadMembership={loadPaid}
        loadListings={async () => [listing({ isActive: false })]}
      />,
    );

    await screen.findByText('Pan artesanal');

    expect(screen.queryByRole('button', { name: 'Retirar' })).toBeNull();
  });

  it('closes an active listing and refreshes the list', async () => {
    const removeListing = vi.fn().mockResolvedValue(undefined);
    const loadListings = vi
      .fn()
      .mockResolvedValueOnce([listing()])
      .mockResolvedValue([listing({ isActive: false })]);
    const user = userEvent.setup();

    render(
      <MyListingsPanel
        loadMembership={loadPaid}
        loadListings={loadListings}
        removeListing={removeListing}
      />,
    );

    await screen.findByText(/Activa/);
    await user.click(screen.getByRole('button', { name: 'Retirar' }));

    await waitFor(() => expect(removeListing).toHaveBeenCalledWith('l1'));
    expect(await screen.findByText(/Retirada/)).toBeTruthy();
  });

  it('opens the form to publish something new', async () => {
    const user = userEvent.setup();

    render(<MyListingsPanel loadMembership={loadPaid} loadListings={async () => []} />);

    await screen.findByText(/Todavía no ha publicado nada/);
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    expect(screen.getByLabelText('Título')).toBeTruthy();
  });
});
