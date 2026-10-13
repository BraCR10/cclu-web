import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '@/shared/components/Checkbox';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Checkbox', () => {
  it('toggles when its label is clicked', async () => {
    renderWithIntl(<Checkbox label="Acepto los Estatutos" />);

    await userEvent.click(screen.getByText('Acepto los Estatutos'));

    expect(screen.getByRole('checkbox', { name: 'Acepto los Estatutos' })).toBeChecked();
  });

  it('toggles from the keyboard', async () => {
    renderWithIntl(<Checkbox label="Acepto" />);

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('shows an error and marks itself invalid', () => {
    renderWithIntl(<Checkbox label="Acepto" error="Este campo es obligatorio." />);

    expect(screen.getByRole('checkbox')).toBeInvalid();
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Este campo es obligatorio.');
  });
});
