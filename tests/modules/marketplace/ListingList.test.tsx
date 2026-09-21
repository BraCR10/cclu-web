import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingList } from '@/modules/marketplace/components/ListingList';
import type { Listing, ListingPage } from '@/modules/marketplace/api/listings';
import { business } from './fixtures';

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
    business: business(),
    ...overrides,
  };
}

function page(overrides: Partial<ListingPage> = {}): ListingPage {
  return { items: [listing()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

describe('ListingList', () => {
  it('lists what the search answers with', async () => {
    render(<ListingList search={vi.fn(async () => page())} />);

    expect(await screen.findByText('Pan artesanal')).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
  });

  it('says so when nothing matches the filter', async () => {
    render(<ListingList search={async () => page({ items: [], total: 0 })} />);

    expect(await screen.findByText(/No hay productos ni servicios/)).toBeTruthy();
  });

  it('reports a search it could not complete', async () => {
    render(
      <ListingList
        search={async () => {
          throw new Error('network');
        }}
      />,
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('sends the typed text as the name filter once the form is submitted', async () => {
    const search = vi.fn(async () => page());
    const user = userEvent.setup();

    render(<ListingList search={search} />);

    await screen.findByText('Pan artesanal');
    await user.type(screen.getByLabelText('Buscar'), 'Pan');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({
        name: 'Pan',
        canton: undefined,
        sector: undefined,
        page: 1,
      }),
    );
  });

  it('does not offer a next page once there is nothing more', async () => {
    render(<ListingList search={async () => page({ hasMore: false })} />);

    await screen.findByText('Pan artesanal');
    const next = screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement;

    expect(next.disabled).toBe(true);
  });
});
