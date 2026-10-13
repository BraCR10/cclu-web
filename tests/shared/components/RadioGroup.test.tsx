import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '@/shared/components/RadioGroup';
import { Radio } from '@/shared/components/Radio';
import { renderWithIntl } from '../../support/renderWithIntl';

function renderGroup(onChange = vi.fn()) {
  renderWithIntl(
    <RadioGroup legend="Tipo de cédula">
      <Radio name="idType" value="physical" label="Física" onChange={onChange} />
      <Radio name="idType" value="legal" label="Jurídica" onChange={onChange} />
    </RadioGroup>,
  );
}

describe('Radio and RadioGroup', () => {
  it('groups the options under their legend', () => {
    renderGroup();

    expect(screen.getByRole('group', { name: 'Tipo de cédula' })).toBeInTheDocument();
  });

  it('keeps a single option selected', async () => {
    renderGroup();

    await userEvent.click(screen.getByLabelText('Física'));
    await userEvent.click(screen.getByLabelText('Jurídica'));

    expect(screen.getByLabelText('Física')).not.toBeChecked();
    expect(screen.getByLabelText('Jurídica')).toBeChecked();
  });

  it('moves between options with the arrow keys', async () => {
    renderGroup();

    await userEvent.click(screen.getByLabelText('Física'));
    await userEvent.keyboard('{ArrowDown}');

    expect(screen.getByLabelText('Jurídica')).toBeChecked();
  });

  it('shows an error for the whole group', () => {
    renderWithIntl(
      <RadioGroup legend="Tipo" error="Elegí una opción.">
        <Radio name="t" value="a" label="A" />
      </RadioGroup>,
    );

    expect(screen.getByRole('group', { name: 'Tipo' })).toHaveAccessibleDescription(
      'Elegí una opción.',
    );
  });
});
