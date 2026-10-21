import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryFilterFields } from '@/modules/marketplace/components/DirectoryFilterFields';
import { renderWithIntl } from '../../../support/renderWithIntl';

vi.mock('@/modules/marketplace/hooks/useDirectoryCatalogs', () => ({
  useDistricts: (canton: string) => (canton === 'la-union' ? ['San Juan', 'Tres Ríos'] : []),
}));

const CANTONS = [
  { _id: 'la-union', name: 'La Unión', province: 'Cartago' },
  { _id: 'cartago', name: 'Cartago', province: 'Cartago' },
];

function renderFields(filters: { activity: string; canton: string; district: string }) {
  const change = vi.fn();

  renderWithIntl(
    <DirectoryFilterFields filters={filters} change={change} cantons={CANTONS} activities={[]} />,
  );

  return change;
}

describe('DirectoryFilterFields', () => {
  it('offers no district until a canton is chosen', () => {
    renderFields({ activity: '', canton: '', district: '' });

    expect(screen.getByLabelText('Distrito')).toBeDisabled();
  });

  it('offers the districts of the chosen canton', () => {
    renderFields({ activity: '', canton: 'la-union', district: '' });

    expect(screen.getByRole('option', { name: 'Tres Ríos' })).toBeInTheDocument();
  });

  it('drops the district when the canton changes, since it belonged to the other one', async () => {
    const change = renderFields({ activity: '', canton: 'la-union', district: 'San Juan' });

    await userEvent.selectOptions(screen.getByLabelText('Cantón'), 'cartago');

    expect(change).toHaveBeenCalledWith({ canton: 'cartago', district: '' });
  });
});
