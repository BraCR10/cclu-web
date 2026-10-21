import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { countActiveFilters, FilterSheet } from '@/shared/components/FilterSheet';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

type Filters = { status: string };

const EMPTY: Filters = { status: 'all' };

function renderSheet(value: Filters, onApply: (filters: Filters) => void) {
  return renderWithIntl(
    <FilterSheet<Filters>
      title="Filtros de suscriptores"
      value={value}
      empty={EMPTY}
      onApply={onApply}
      renderFields={(filters, change) => (
        <label>
          Estado
          <select
            value={filters.status}
            onChange={(event) => change({ status: event.target.value })}
          >
            <option value="all">Todos</option>
            <option value="active">Suscrito</option>
          </select>
        </label>
      )}
    />,
  );
}

describe('FilterSheet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('counts only the filters that differ from their empty value', () => {
    expect(
      countActiveFilters({ status: 'active', canton: 'all' }, { status: 'all', canton: 'all' }),
    ).toBe(1);
  });

  it('applies a change at once on a desktop', async () => {
    viewportIsDesktop(true);
    const onApply = vi.fn();
    renderSheet(EMPTY, onApply);

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'active');

    expect(onApply).toHaveBeenCalledWith({ status: 'active' });
  });

  it('waits for Aplicar filtros on a telephone', async () => {
    viewportIsDesktop(false);
    const onApply = vi.fn();
    renderSheet(EMPTY, onApply);

    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'active');
    expect(onApply).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(onApply).toHaveBeenCalledWith({ status: 'active' });
  });

  it('clears every filter back to its empty value', async () => {
    viewportIsDesktop(false);
    const onApply = vi.fn();
    renderSheet({ status: 'active' }, onApply);

    await userEvent.click(screen.getByRole('button', { name: 'Filtros, 1 activo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));

    expect(onApply).toHaveBeenCalledWith(EMPTY);
  });
});
