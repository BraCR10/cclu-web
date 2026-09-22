import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscountCatalog } from '@/modules/marketplace/components/DiscountCatalog';
import type { Discount, DiscountPage } from '@/modules/marketplace/api/discounts';
import { business } from './fixtures';

function discount(overrides: Partial<Discount> = {}): Discount {
  return {
    id: 'd1',
    description: '10% de descuento en compras al por mayor.',
    conditions: 'Presentando el carné digital.',
    validUntil: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    business: business(),
    ...overrides,
  };
}

function page(overrides: Partial<DiscountPage> = {}): DiscountPage {
  return { items: [discount()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

describe('DiscountCatalog', () => {
  it('lists the discounts other affiliates offer', async () => {
    render(<DiscountCatalog search={vi.fn(async () => page())} />);

    expect(await screen.findByText(/10% de descuento/)).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
  });

  it('opens the conditions and the contact on demand', async () => {
    const user = userEvent.setup();

    render(<DiscountCatalog search={async () => page()} />);

    await screen.findByText(/10% de descuento/);
    expect(screen.queryByText(/Presentando el carné digital/)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Ver condiciones y contacto' }));

    expect(screen.getByText(/Presentando el carné digital/)).toBeTruthy();
    expect(screen.getByText('socio@example.cr')).toBeTruthy();
  });

  it('says so when nothing matches the criteria', async () => {
    render(<DiscountCatalog search={async () => page({ items: [], total: 0 })} />);

    expect(await screen.findByText(/No hay descuentos vigentes/)).toBeTruthy();
  });
});
