import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MarketplacePage } from '@/modules/marketplace/components/MarketplacePage';
import { PublicationPage } from '@/modules/marketplace/components/PublicationPage';
import type { MarketplacePublication } from '@/modules/marketplace/api/marketplace';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readMarketplace = vi.fn();
const readMarketplaceItem = vi.fn();

vi.mock('@/modules/marketplace/api/marketplace', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/marketplace/api/marketplace')>()),
  readMarketplace: (query: unknown) => readMarketplace(query),
  readMarketplaceItem: (id: string) => readMarketplaceItem(id),
}));

const PRODUCT: MarketplacePublication = {
  id: '65f0c3a1b2c3d4e5f6a7b8d1',
  type: 'product',
  title: 'Café molido 500 g',
  description: 'Tueste medio, molido para cafetera.',
  price: 5500,
  imageUrl: null,
  category: { _id: '65f0c3a1b2c3d4e5f6a7b8cb', name: 'Cafeterías' },
  percentage: null,
  condition: null,
  startsAt: null,
  endsAt: null,
  publishedAt: '2026-10-20T15:00:00.000Z',
  business: {
    businessName: 'Café Loma Verde',
    memberCode: 'CLU001',
    district: 'Tres Ríos',
    canton: 'La Unión',
    logoUrl: null,
  },
};

function page(items: MarketplacePublication[]) {
  return {
    items,
    page: 1,
    pageSize: 12,
    total: items.length,
    pageCount: 1,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readMarketplace.mockResolvedValue(page([PRODUCT]));
  readMarketplaceItem.mockResolvedValue(PRODUCT);
});

describe('the marketplace', () => {
  it('shows what is on offer with its price and who sells it', async () => {
    renderWithIntl(<MarketplacePage />);

    expect(await screen.findByText('Café molido 500 g')).toBeVisible();
    expect(screen.getByText('Producto')).toBeVisible();
    expect(screen.getByText(/Café Loma Verde/)).toBeVisible();
  });

  it('says when nothing matches', async () => {
    readMarketplace.mockResolvedValue(page([]));

    renderWithIntl(<MarketplacePage />);

    expect(await screen.findByText('Todavía no hay publicaciones con ese criterio.')).toBeVisible();
  });

  // A promotion says what it takes off instead of a price.
  it('reads a discount as a percentage', async () => {
    readMarketplace.mockResolvedValue(
      page([
        {
          ...PRODUCT,
          id: '65f0c3a1b2c3d4e5f6a7b8d2',
          type: 'discount',
          title: 'Agremiados',
          price: null,
          percentage: 15,
          condition: 'Con el carné al día',
          startsAt: '2026-10-01',
          endsAt: '2026-11-30',
        },
      ]),
    );

    renderWithIntl(<MarketplacePage />);

    expect(await screen.findByText('15% de descuento')).toBeVisible();
    expect(screen.getByText('Descuento')).toBeVisible();
  });
});

describe('one publication', () => {
  it('shows it with the way to the business page', async () => {
    renderWithIntl(<PublicationPage publicationId={PRODUCT.id} />);

    expect((await screen.findAllByRole('heading', { name: 'Café molido 500 g' }))[0]).toBeVisible();
    expect(screen.getByText('Tueste medio, molido para cafetera.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver la ficha del comercio' })).toHaveAttribute(
      'href',
      '/directory/CLU001',
    );
  });

  it('says it is gone when it cannot be read', async () => {
    readMarketplaceItem.mockRejectedValue(new Error('not found'));

    renderWithIntl(<PublicationPage publicationId={PRODUCT.id} />);

    expect(
      await screen.findByText(
        'No encontramos esa publicación. Puede haber vencido o haberse retirado.',
      ),
    ).toBeVisible();
  });
});
