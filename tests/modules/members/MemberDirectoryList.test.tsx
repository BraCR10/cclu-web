import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberDirectoryList } from '@/modules/members/components/MemberDirectoryList';
import type { DirectoryEntry, DirectoryPage } from '@/modules/members/api/directory';

const CANTONS = [{ _id: 'c1', name: 'La Unión', province: 'Cartago' }];
const SECTORS = [{ _id: 's1', name: 'Comercio' }];

function entry(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    memberCode: 'MA7K2Q4',
    businessName: 'Panadería Tres Ríos',
    businessDescription: 'Panadería artesanal.',
    memberType: 'business',
    sector: 'Comercio',
    canton: 'La Unión',
    province: 'Cartago',
    location: 'Centro',
    phone: '22791234',
    whatsappNumber: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    website: null,
    logoUrl: null,
    affiliatedSince: '2026-03-04T12:00:00.000Z',
    ...overrides,
  };
}

function page(overrides: Partial<DirectoryPage> = {}): DirectoryPage {
  return { items: [entry()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

function renderList(overrides: Parameters<typeof MemberDirectoryList>[0] = {}) {
  const search = overrides.search ?? vi.fn(async () => page());

  render(
    <MemberDirectoryList
      loadCantons={overrides.loadCantons ?? (async () => CANTONS)}
      loadSectors={overrides.loadSectors ?? (async () => SECTORS)}
      search={search}
    />,
  );

  return { search, user: userEvent.setup() };
}

describe('MemberDirectoryList', () => {
  it('lists what the search answers with', async () => {
    renderList();

    expect(await screen.findByText('Panadería Tres Ríos')).toBeTruthy();
  });

  it('says so when nothing matches the filters', async () => {
    renderList({ search: async () => page({ items: [], total: 0 }) });

    expect(await screen.findByText(/No se encontró ningún afiliado/)).toBeTruthy();
  });

  it('reports a search it could not complete', async () => {
    renderList({
      search: async () => {
        throw new Error('network');
      },
    });

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('sends the typed name once the form is submitted', async () => {
    const { search, user } = renderList();

    await screen.findByText('Panadería Tres Ríos');
    await user.type(screen.getByLabelText('Nombre'), 'Panadería');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({
        name: 'Panadería',
        canton: undefined,
        sector: undefined,
        page: 1,
      }),
    );
  });

  it('offers the catalogs as closed lists', async () => {
    renderList();

    const canton = (await screen.findByLabelText('Cantón')) as HTMLSelectElement;
    const sector = screen.getByLabelText('Sector') as HTMLSelectElement;

    expect(canton.tagName).toBe('SELECT');
    expect(sector.tagName).toBe('SELECT');
  });

  it('starts over at the first page whenever the filters change', async () => {
    const search = vi
      .fn()
      .mockResolvedValueOnce(page({ hasMore: true, page: 1 }))
      .mockResolvedValue(page());
    const { user } = renderList({ search });

    await screen.findByText('Panadería Tres Ríos');
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({
        name: undefined,
        canton: undefined,
        sector: undefined,
        page: 2,
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({
        name: undefined,
        canton: undefined,
        sector: undefined,
        page: 1,
      }),
    );
  });

  it('does not offer a previous page from the first one', async () => {
    renderList();

    await screen.findByText('Panadería Tres Ríos');

    const previous = screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement;
    expect(previous.disabled).toBe(true);
  });

  it('does not offer a next page once there is nothing more', async () => {
    renderList({ search: async () => page({ hasMore: false }) });

    await screen.findByText('Panadería Tres Ríos');

    const next = screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
  });
});
