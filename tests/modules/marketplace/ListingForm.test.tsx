import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingForm } from '@/modules/marketplace/components/ListingForm';
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

describe('ListingForm', () => {
  it('shows no image uploader until a listing actually exists', () => {
    render(<ListingForm onSaved={vi.fn()} />);

    expect(screen.queryByText('Imagen')).toBeNull();
  });

  it('offers an image uploader once editing an existing listing', () => {
    render(<ListingForm listing={listing()} onSaved={vi.fn()} />);

    expect(screen.getByText('Imagen')).toBeTruthy();
  });

  it('refuses to submit without a title or a description', async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(<ListingForm onSaved={vi.fn()} create={create} />);
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() =>
      expect(document.getElementById('title-error')?.textContent).toContain(
        'Este dato es obligatorio.',
      ),
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses a price that is not a real number', async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(<ListingForm onSaved={vi.fn()} create={create} />);

    await user.type(screen.getByLabelText('Título'), 'Pan artesanal');
    await user.type(screen.getByLabelText('Descripción'), 'Pan de masa madre.');
    await user.type(screen.getByLabelText('Precio (₡)'), '-5');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() =>
      expect(document.getElementById('price-error')?.textContent).toContain(
        'El precio no es válido.',
      ),
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a listing with what was filled in, price included', async () => {
    const create = vi.fn().mockResolvedValue(listing());
    const onSaved = vi.fn();
    const user = userEvent.setup();

    render(<ListingForm onSaved={onSaved} create={create} />);

    await user.type(screen.getByLabelText('Título'), 'Pan artesanal');
    await user.type(screen.getByLabelText('Descripción'), 'Pan de masa madre.');
    await user.type(screen.getByLabelText('Precio (₡)'), '2500');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0][0]).toMatchObject({
      title: 'Pan artesanal',
      description: 'Pan de masa madre.',
      price: 2500,
    });
    expect(onSaved).toHaveBeenCalledWith(listing());
  });

  it('creates a listing with no price at all', async () => {
    const create = vi.fn().mockResolvedValue(listing({ price: null }));
    const user = userEvent.setup();

    render(<ListingForm onSaved={vi.fn()} create={create} />);

    await user.type(screen.getByLabelText('Título'), 'Pan artesanal');
    await user.type(screen.getByLabelText('Descripción'), 'Pan de masa madre.');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0][0].price).toBe('');
  });

  it('saves an edit through update, not create', async () => {
    const update = vi.fn().mockResolvedValue(listing({ price: 3000 }));
    const user = userEvent.setup();

    render(<ListingForm listing={listing()} onSaved={vi.fn()} update={update} />);

    const price = screen.getByLabelText('Precio (₡)') as HTMLInputElement;
    await user.clear(price);
    await user.type(price, '3000');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith('l1', expect.objectContaining({ price: 3000 })),
    );
  });

  it('calls onDone without saving anything', async () => {
    const onDone = vi.fn();
    const create = vi.fn();
    const user = userEvent.setup();

    render(<ListingForm onSaved={vi.fn()} onDone={onDone} create={create} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onDone).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });
});
