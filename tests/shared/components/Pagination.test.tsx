import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination, visiblePages } from '@/shared/components/Pagination';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('visiblePages', () => {
  it('lists every page when there are few', () => {
    expect(visiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('keeps the ends and the neighbours of the current page, with gaps between', () => {
    expect(visiblePages(1, 13)).toEqual([1, 2, 3, 'gap', 13]);
    expect(visiblePages(7, 13)).toEqual([1, 'gap', 6, 7, 8, 'gap', 13]);
    expect(visiblePages(13, 13)).toEqual([1, 'gap', 11, 12, 13]);
  });

  it('never writes a gap that hides a single page', () => {
    expect(visiblePages(4, 13)).toEqual([1, 2, 3, 4, 5, 'gap', 13]);
  });
});

describe('Pagination', () => {
  it('marks the current page and moves to another', async () => {
    const onPageChange = vi.fn();
    renderWithIntl(<Pagination page={1} pageCount={13} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('cannot go before the first page or past the last', () => {
    const { unmount } = renderWithIntl(
      <Pagination page={1} pageCount={3} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    unmount();

    renderWithIntl(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('shows the summary it is given inside a labelled navigation', () => {
    renderWithIntl(
      <Pagination
        page={1}
        pageCount={13}
        onPageChange={() => {}}
        summary="Mostrando 1 a 12 de 148 comercios"
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1 a 12 de 148 comercios')).toBeInTheDocument();
  });

  it('renders nothing for a single page', () => {
    renderWithIntl(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
