import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MarketplacePage } from '@/modules/marketplace/components/MarketplacePage';
import type { MarketplacePublication } from '@/modules/marketplace/api/marketplace';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readMarketplace = vi.fn();

vi.mock('@/modules/marketplace/api/marketplace', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/marketplace/api/marketplace')>()),
  readMarketplace: (query: unknown) => readMarketplace(query),
}));

const business = {
  businessName: 'Café Loma Verde',
  memberCode: 'M-A7K2-Q4',
  district: 'San Juan',
  canton: 'La Unión',
  logoUrl: null,
};

const promotion: MarketplacePublication = {
  id: 'pub1',
  type: 'promotion',
  title: '2x1 en capuchinos',
  description: 'Todos los martes.',
  price: null,
  imageUrl: null,
  category: null,
  percentage: null,
  condition: null,
  startsAt: '2026-10-01',
  endsAt: '2026-10-31',
  publishedAt: '2026-10-01T10:00:00.000Z',
  business,
};

const discount: MarketplacePublication = {
  id: 'pub2',
  type: 'discount',
  title: '15 % en vacunación',
  description: 'Para clientes con carné.',
  price: null,
  imageUrl: null,
  category: null,
  percentage: 15,
  condition: 'Con el carné de la cámara',
  startsAt: null,
  endsAt: null,
  publishedAt: '2026-10-01T10:00:00.000Z',
  business,
};

function pageOf(items: MarketplacePublication[]) {
  return { items, page: 1, pageSize: 12, total: items.length, pageCount: 1 };
}

describe('MarketplacePage sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewportIsDesktop(true);
    readMarketplace.mockResolvedValue(pageOf([promotion]));
  });

  // P-06: the promotions section asks the API for one kind and offers no kind
  // filter of its own, because it is already the filter.
  it('the promotions page asks only for promotions and draws the three sections', async () => {
    renderWithIntl(<MarketplacePage type="promotion" />);

    expect((await screen.findAllByRole('heading', { name: 'Promociones' })).length).toBeGreaterThan(
      0,
    );
    expect(readMarketplace).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'promotion', search: '', page: 1 }),
    );

    const tabs = screen.getAllByRole('link', {
      name: /Productos y servicios|Promociones|Descuentos/,
    });
    const active = tabs.find((tab) => tab.getAttribute('aria-current') === 'page');

    expect(active?.textContent).toBe('Promociones');
    expect(screen.getByRole('link', { name: 'Descuentos' }).getAttribute('href')).toBe(
      '/discounts',
    );
    expect(screen.getByRole('link', { name: 'Productos y servicios' }).getAttribute('href')).toBe(
      '/marketplace',
    );
    // The kind is not offered again as a filter.
    expect(screen.queryByText('Tipo de publicación')).toBeNull();
  });

  // P-08: a discount says how much comes off, which is what the card shows
  // instead of a price.
  it('the discounts page asks only for discounts and shows the percentage', async () => {
    readMarketplace.mockResolvedValue(pageOf([discount]));

    renderWithIntl(<MarketplacePage type="discount" />);

    expect(
      (await screen.findAllByRole('heading', { name: 'Descuentos para agremiados' })).length,
    ).toBeGreaterThan(0);
    expect(readMarketplace).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'discount', search: '', page: 1 }),
    );
    expect(await screen.findByText('15% de descuento')).toBeTruthy();
  });

  it('the whole marketplace keeps offering the kind as a filter', async () => {
    renderWithIntl(<MarketplacePage />);

    expect((await screen.findAllByRole('heading', { name: 'Marketplace' })).length).toBeGreaterThan(
      0,
    );
    expect(readMarketplace).toHaveBeenCalledWith(
      expect.objectContaining({ type: '', search: '', page: 1 }),
    );

    const tabs = screen.getAllByRole('link', {
      name: /Productos y servicios|Promociones|Descuentos/,
    });

    expect(tabs.find((tab) => tab.getAttribute('aria-current') === 'page')?.textContent).toBe(
      'Productos y servicios',
    );
  });
});
