import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromotionList } from '@/modules/marketplace/components/PromotionList';
import type { Promotion, PromotionPage } from '@/modules/marketplace/api/promotions';
import { business } from './fixtures';

function promotion(overrides: Partial<Promotion> = {}): Promotion {
  return {
    id: 'pr1',
    title: '2x1 en pan dulce',
    description: 'Aplica todos los martes.',
    conditions: 'Solo en tienda.',
    validUntil: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    business: business(),
    ...overrides,
  };
}

function page(overrides: Partial<PromotionPage> = {}): PromotionPage {
  return { items: [promotion()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

describe('PromotionList', () => {
  it('lists what the search answers with', async () => {
    render(<PromotionList search={vi.fn(async () => page())} />);

    expect(await screen.findByText('2x1 en pan dulce')).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
  });

  it('says so when nothing matches the criteria', async () => {
    render(<PromotionList search={async () => page({ items: [], total: 0 })} />);

    expect(await screen.findByText(/No hay promociones vigentes/)).toBeTruthy();
  });

  it('sends the typed text as the name filter', async () => {
    const search = vi.fn(async () => page());
    const user = userEvent.setup();

    render(<PromotionList search={search} />);

    await screen.findByText('2x1 en pan dulce');
    await user.type(screen.getByLabelText('Buscar'), 'pan');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({
        name: 'pan',
        canton: undefined,
        sector: undefined,
        page: 1,
      }),
    );
  });

  it('reports a search it could not complete', async () => {
    render(
      <PromotionList
        search={async () => {
          throw new Error('network');
        }}
      />,
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
