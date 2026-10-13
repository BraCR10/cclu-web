import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/shared/components/Input';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Input', () => {
  it('is reachable by its label and accepts typing', async () => {
    renderWithIntl(<Input label="Nombre comercial" name="businessName" />);

    await userEvent.type(screen.getByLabelText('Nombre comercial'), 'Café');

    expect(screen.getByLabelText('Nombre comercial')).toHaveValue('Café');
  });

  it('describes itself with its help text', () => {
    renderWithIntl(<Input label="Nombre comercial" help="Así aparecerá en el directorio." />);

    expect(screen.getByLabelText('Nombre comercial')).toHaveAccessibleDescription(
      'Así aparecerá en el directorio.',
    );
  });

  it('shows an error under the input, marks it invalid and replaces the help', () => {
    renderWithIntl(
      <Input label="Nombre comercial" help="Ayuda." error="El texto es demasiado largo." />,
    );

    const input = screen.getByLabelText('Nombre comercial');

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('El texto es demasiado largo.');
    expect(screen.queryByText('Ayuda.')).not.toBeInTheDocument();
  });

  it('cannot be edited when read-only, and says so', () => {
    renderWithIntl(<Input label="Código" readOnly defaultValue="CLU001" />);

    expect(screen.getByLabelText('Código')).toHaveAttribute('readonly');
  });

  it('cannot be focused when disabled', async () => {
    renderWithIntl(<Input label="Código" disabled />);

    await userEvent.tab();

    expect(screen.getByLabelText('Código')).not.toHaveFocus();
  });
});
