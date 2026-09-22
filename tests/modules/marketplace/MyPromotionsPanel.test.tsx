import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyPromotionsPanel } from '@/modules/marketplace/components/MyPromotionsPanel';
import type { OwnPromotion } from '@/modules/marketplace/api/promotions';
import type { Membership } from '@/modules/members/api/membership';
import { business } from './fixtures';

function promotion(overrides: Partial<OwnPromotion> = {}): OwnPromotion {
  return {
    id: 'pr1',
    title: '2x1 en pan dulce',
    description: 'Aplica todos los martes.',
    conditions: 'Solo en tienda.',
    validUntil: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    business: business(),
    isActive: true,
    adminStatus: 'active',
    expired: false,
    ...overrides,
  };
}

function membership(overrides: Partial<Membership> = {}): Membership {
  return {
    type: 'paid',
    paidUntil: '2026-12-31T00:00:00.000Z',
    feeAmount: 15000,
    benefits: { free: [], paid: [] },
    ...overrides,
  };
}

const loadPaid = async () => membership();
const loadFree = async () => membership({ type: 'free', paidUntil: null });

describe('MyPromotionsPanel', () => {
  it('lists the promotions with their state', async () => {
    render(
      <MyPromotionsPanel
        loadPromotions={async () => [promotion(), promotion({ id: 'pr2', expired: true })]}
        loadMembership={loadPaid}
      />,
    );

    expect(await screen.findByText(/Activa/)).toBeTruthy();
    expect(screen.getByText(/Vencida/)).toBeTruthy();
  });

  it('gates publishing behind the paid membership', async () => {
    render(<MyPromotionsPanel loadPromotions={async () => []} loadMembership={loadFree} />);

    expect(await screen.findByText(/requiere membresía paga/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Publicar promoción' })).toBeNull();
  });

  it('shows a blocked promotion without actions', async () => {
    render(
      <MyPromotionsPanel
        loadPromotions={async () => [promotion({ adminStatus: 'blocked' })]}
        loadMembership={loadPaid}
      />,
    );

    expect(await screen.findByText('Bloqueada por la Cámara')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Editar' })).toBeNull();
  });

  it('offers reactivation only when the promotion is closed or expired', async () => {
    render(
      <MyPromotionsPanel
        loadPromotions={async () => [promotion({ isActive: false })]}
        loadMembership={loadPaid}
      />,
    );

    expect(await screen.findByRole('button', { name: 'Reactivar' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retirar' })).toBeNull();
  });

  it('closes an open promotion', async () => {
    const removePromotion = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MyPromotionsPanel
        loadPromotions={async () => [promotion()]}
        loadMembership={loadPaid}
        removePromotion={removePromotion}
      />,
    );

    await screen.findByText('2x1 en pan dulce');
    await user.click(screen.getByRole('button', { name: 'Retirar' }));

    await waitFor(() => expect(removePromotion).toHaveBeenCalledWith('pr1'));
  });
});
