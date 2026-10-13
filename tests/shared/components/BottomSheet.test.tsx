import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from '@/shared/components/BottomSheet';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('BottomSheet', () => {
  it('rises as a modal dialog named by its title', () => {
    renderWithIntl(
      <BottomSheet open title="Filtros" onClose={() => {}}>
        Contenido
      </BottomSheet>,
    );

    expect(screen.getByRole('dialog', { name: 'Filtros' })).toHaveAttribute('aria-modal', 'true');
  });

  it('closes with Escape and from a close button large enough to tap', async () => {
    const onClose = vi.fn();
    renderWithIntl(
      <BottomSheet open title="Filtros" onClose={onClose}>
        Contenido
      </BottomSheet>,
    );

    await userEvent.keyboard('{Escape}');
    const close = screen.getByRole('button', { name: 'Cerrar' });
    await userEvent.click(close);

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(close).toHaveClass('size-11');
  });

  it('renders nothing while closed', () => {
    renderWithIntl(
      <BottomSheet open={false} title="Filtros" onClose={() => {}}>
        Contenido
      </BottomSheet>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
