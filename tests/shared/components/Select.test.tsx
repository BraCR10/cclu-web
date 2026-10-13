import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/shared/components/Select';
import { renderWithIntl } from '../../support/renderWithIntl';

const options = [
  { value: 'business', label: 'Empresa' },
  { value: 'association', label: 'Asociación' },
];

describe('Select', () => {
  it('lets a person choose an option by its label', async () => {
    renderWithIntl(<Select label="Tipo de agremiado" options={options} />);

    await userEvent.selectOptions(screen.getByLabelText('Tipo de agremiado'), 'Asociación');

    expect(screen.getByLabelText('Tipo de agremiado')).toHaveValue('association');
  });

  it('offers a placeholder that cannot be chosen once something is picked', () => {
    renderWithIntl(<Select label="Tipo" options={options} placeholder="Elegí una opción" />);

    expect(screen.getByRole('option', { name: 'Elegí una opción' })).toBeDisabled();
  });

  it('shows an error under the field and marks it invalid', () => {
    renderWithIntl(<Select label="Tipo" options={options} error="Elegí una opción." />);

    expect(screen.getByLabelText('Tipo')).toBeInvalid();
    expect(screen.getByLabelText('Tipo')).toHaveAccessibleDescription('Elegí una opción.');
  });
});
