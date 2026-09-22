import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromotionForm } from '@/modules/marketplace/components/PromotionForm';
import { MESSAGES } from '@/shared/config/messages';
import type { OwnPromotion } from '@/modules/marketplace/api/promotions';
import { business } from './fixtures';

function promotion(overrides: Partial<OwnPromotion> = {}): OwnPromotion {
  return {
    id: 'pr1',
    title: '2x1 en pan dulce',
    description: 'Aplica todos los martes.',
    conditions: 'Solo en tienda.',
    validUntil: '2020-01-01T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    business: business(),
    isActive: true,
    adminStatus: 'active',
    expired: true,
    ...overrides,
  };
}

describe('PromotionForm', () => {
  it('refuses to publish without its four required fields', async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(<PromotionForm onSaved={vi.fn()} create={create} />);
    await user.click(screen.getByRole('button', { name: 'Publicar promoción' }));

    await waitFor(() =>
      expect(document.getElementById('title-error')?.textContent).toContain(MESSAGES.required),
    );
    expect(document.getElementById('validUntil-error')?.textContent).toContain(MESSAGES.required);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a promotion with what was filled in', async () => {
    const create = vi.fn().mockResolvedValue(promotion());
    const onSaved = vi.fn();
    const user = userEvent.setup();

    render(<PromotionForm onSaved={onSaved} create={create} />);

    await user.type(screen.getByLabelText('Nombre de la promoción'), '2x1 en pan dulce');
    await user.type(screen.getByLabelText('Descripción'), 'Aplica todos los martes.');
    await user.type(screen.getByLabelText('Condiciones'), 'Solo en tienda.');
    await user.type(screen.getByLabelText('Vigente hasta'), '2030-12-31');
    await user.click(screen.getByRole('button', { name: 'Publicar promoción' }));

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0][0]).toMatchObject({
      title: '2x1 en pan dulce',
      validUntil: '2030-12-31',
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('refuses to reactivate with a validity already past', async () => {
    const update = vi.fn();
    const user = userEvent.setup();

    render(<PromotionForm promotion={promotion()} reactivate onSaved={vi.fn()} update={update} />);

    await user.click(screen.getByRole('button', { name: 'Reactivar promoción' }));

    await waitFor(() =>
      expect(document.getElementById('validUntil-error')?.textContent).toContain(
        MESSAGES.expired_needs_new_validity,
      ),
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('reactivates once a future validity is given', async () => {
    const update = vi.fn().mockResolvedValue(promotion({ expired: false }));
    const user = userEvent.setup();

    render(<PromotionForm promotion={promotion()} reactivate onSaved={vi.fn()} update={update} />);

    const validUntil = screen.getByLabelText('Vigente hasta') as HTMLInputElement;
    await user.clear(validUntil);
    await user.type(validUntil, '2030-12-31');
    await user.click(screen.getByRole('button', { name: 'Reactivar promoción' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        'pr1',
        expect.objectContaining({ isActive: true, validUntil: '2030-12-31' }),
      ),
    );
  });
});
