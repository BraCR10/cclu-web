import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReasonDialog } from '@/shared/components/ReasonDialog';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

function renderDialog(onConfirm: (reason: string) => Promise<void>) {
  return renderWithIntl(
    <ReasonDialog
      open
      title="Rechazar solicitud"
      label="Motivo (obligatorio)"
      confirmLabel="Rechazar solicitud"
      length={{ minimum: 10, maximum: 500 }}
      onConfirm={onConfirm}
      onClose={() => {}}
    />,
  );
}

describe('ReasonDialog', () => {
  beforeEach(() => {
    viewportIsDesktop(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not send a reason shorter than the minimum', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    renderDialog(onConfirm);

    await userEvent.type(screen.getByLabelText('Motivo (obligatorio)'), 'corto');
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar solicitud' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText('Escribí un motivo de entre 10 y 500 caracteres.')).toBeInTheDocument();
  });

  it('sends the reason without the spaces around it', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    renderDialog(onConfirm);

    await userEvent.type(
      screen.getByLabelText('Motivo (obligatorio)'),
      '  No pudimos verificar la cédula.  ',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar solicitud' }));

    expect(onConfirm).toHaveBeenCalledWith('No pudimos verificar la cédula.');
  });
});
