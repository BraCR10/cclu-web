import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModerationPanel } from '@/modules/admin/components/ModerationPanel';
import type { ModeratedPublication, ModerationPage } from '@/modules/admin/api/moderation';

function publication(overrides: Partial<ModeratedPublication> = {}): ModeratedPublication {
  return {
    id: 'pub1',
    type: 'products',
    title: 'Pan artesanal',
    isActive: true,
    adminStatus: 'active',
    createdAt: '2026-09-01T00:00:00.000Z',
    business: { businessName: 'Panadería Tres Ríos', memberCode: 'MA7K2Q4' },
    ...overrides,
  };
}

function page(overrides: Partial<ModerationPage> = {}): ModerationPage {
  return { items: [publication()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

describe('ModerationPanel', () => {
  it('lists the publications of the chosen type', async () => {
    render(<ModerationPanel loadPublications={vi.fn(async () => page())} />);

    expect(await screen.findByText('Pan artesanal')).toBeTruthy();
    expect(screen.getByText(/Panadería Tres Ríos/)).toBeTruthy();
  });

  it('deactivates an active publication', async () => {
    const moderate = vi.fn().mockResolvedValue(publication({ adminStatus: 'inactive' }));
    const user = userEvent.setup();

    render(<ModerationPanel loadPublications={async () => page()} moderate={moderate} />);

    await screen.findByText('Pan artesanal');
    await user.click(screen.getByRole('button', { name: 'Inactivar' }));

    await waitFor(() => expect(moderate).toHaveBeenCalledWith('products', 'pub1', 'deactivate'));
  });

  it('asks for confirmation before blocking permanently', async () => {
    const moderate = vi.fn().mockResolvedValue(publication({ adminStatus: 'blocked' }));
    const user = userEvent.setup();

    render(<ModerationPanel loadPublications={async () => page()} moderate={moderate} />);

    await screen.findByText('Pan artesanal');
    await user.click(screen.getByRole('button', { name: 'Bloquear' }));

    expect(screen.getByText(/¿Bloquear permanentemente\?/)).toBeTruthy();
    expect(moderate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Confirmar bloqueo' }));

    await waitFor(() => expect(moderate).toHaveBeenCalledWith('products', 'pub1', 'block'));
  });

  it('offers no actions on a blocked publication', async () => {
    render(
      <ModerationPanel
        loadPublications={async () => page({ items: [publication({ adminStatus: 'blocked' })] })}
      />,
    );

    expect(await screen.findByText('Bloqueada permanentemente')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reactivar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bloquear' })).toBeNull();
  });
});
