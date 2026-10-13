import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/shared/components/Textarea';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Textarea', () => {
  it('counts what was written against its limit', async () => {
    renderWithIntl(<Textarea label="Descripción" maxLength={500} />);

    await userEvent.type(screen.getByLabelText('Descripción'), 'Hola');

    expect(screen.getByText('4/500')).toBeInTheDocument();
  });

  it('shows no counter without a limit', () => {
    renderWithIntl(<Textarea label="Descripción" />);

    expect(screen.queryByText(/\/\d+$/)).not.toBeInTheDocument();
  });

  it('shows an error under the field and marks it invalid', () => {
    renderWithIntl(<Textarea label="Descripción" error="Es demasiado larga." />);

    expect(screen.getByLabelText('Descripción')).toBeInvalid();
    expect(screen.getByLabelText('Descripción')).toHaveAccessibleDescription('Es demasiado larga.');
  });
});
