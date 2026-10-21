import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PagedList } from '@/shared/components/PagedList';
import { renderWithIntl } from '../../support/renderWithIntl';

const ONE_PAGE = { total: 3, page: 1, pageCount: 1 };

function renderList(props: Partial<Parameters<typeof PagedList>[0]> = {}) {
  return renderWithIntl(
    <PagedList
      list={ONE_PAGE}
      loading={false}
      failed={false}
      emptyMessage="No hay pagos por revisar."
      summary="3 pagos"
      onPageChange={() => {}}
      {...props}
    >
      <p>Filas</p>
    </PagedList>,
  );
}

describe('PagedList', () => {
  it('shows the rows and the summary of a single page without page controls', () => {
    renderList();

    expect(screen.getByText('Filas')).toBeInTheDocument();
    expect(screen.getByText('3 pagos')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('offers page controls when there is more than one page', () => {
    renderList({ list: { total: 30, page: 2, pageCount: 4 } });

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
  });

  it('says the list is empty instead of showing rows', () => {
    renderList({ list: { total: 0, page: 1, pageCount: 0 } });

    expect(screen.getByText('No hay pagos por revisar.')).toBeInTheDocument();
    expect(screen.queryByText('Filas')).not.toBeInTheDocument();
  });

  it('tells the person the list could not be read', () => {
    renderList({ list: null, failed: true });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Filas')).not.toBeInTheDocument();
  });
});
