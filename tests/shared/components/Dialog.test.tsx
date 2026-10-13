import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '@/shared/components/Dialog';
import { renderWithIntl } from '../../support/renderWithIntl';

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Dialog
        open={open}
        title="¿Dar de baja?"
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <button type="button">Confirmar</button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('opens as a modal dialog named by its title and takes the focus', async () => {
    renderWithIntl(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));

    const dialog = screen.getByRole('dialog', { name: '¿Dar de baja?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes with Escape and gives the focus back to what opened it', async () => {
    const onClose = vi.fn();
    renderWithIntl(<Harness onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });

  it('closes from its close button', async () => {
    renderWithIntl(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps the focus inside while open', async () => {
    renderWithIntl(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes when the backdrop is clicked', async () => {
    renderWithIntl(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.click(screen.getByTestId('modal-scrim'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
