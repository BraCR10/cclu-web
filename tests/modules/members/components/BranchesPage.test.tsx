import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { BranchesPage } from '@/modules/members/components/BranchesPage';
import type { Branch } from '@/modules/members/api/branches';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readBranches = vi.fn();
const createBranch = vi.fn();
const updateBranch = vi.fn();
const deleteBranch = vi.fn();

vi.mock('@/modules/members/api/branches', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/branches')>()),
  readBranches: () => readBranches(),
  createBranch: (body: unknown) => createBranch(body),
  updateBranch: (id: string, body: unknown) => updateBranch(id, body),
  deleteBranch: (id: string) => deleteBranch(id),
}));

vi.mock('@/modules/members/api/registration', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/registration')>()),
  readCantons: async () => [
    { _id: '65f0c3a1b2c3d4e5f6a7b8c9', name: 'La Unión', province: 'Cartago' },
    { _id: '65f0c3a1b2c3d4e5f6a7b8ca', name: 'Curridabat', province: 'San José' },
  ],
  readActivities: async () => [{ _id: '65f0c3a1b2c3d4e5f6a7b8cb', name: 'Cafeterías' }],
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/member/profile/branches' }));

const PRINCIPAL: Branch = {
  id: '65f0c3a1b2c3d4e5f6a7b8d1',
  name: 'Local principal',
  isPrimary: true,
  canton: { _id: '65f0c3a1b2c3d4e5f6a7b8c9', name: 'La Unión', province: 'Cartago' },
  district: 'Tres Ríos',
  address: 'Frente a la plaza',
  phone: '2279 1234',
  schedule: 'Lunes a sábado, 7:00 a. m. a 6:00 p. m.',
  municipalPermit: 'UNI-2025-0318',
  activity: { _id: '65f0c3a1b2c3d4e5f6a7b8cb', name: 'Cafeterías' },
};

const SEGUNDA: Branch = {
  ...PRINCIPAL,
  id: '65f0c3a1b2c3d4e5f6a7b8d2',
  name: 'Sucursal Curridabat',
  isPrimary: false,
  district: 'Granadilla',
  address: '100 m sur del parque',
  phone: null,
  municipalPermit: null,
};

let list: Branch[] = [];

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <BranchesPage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  list = [PRINCIPAL];
  readBranches.mockImplementation(async () => ({ items: list.slice() }));
  createBranch.mockImplementation(async (body: Branch) => {
    list = [...list, { ...SEGUNDA, ...body }];

    return list[list.length - 1];
  });
  updateBranch.mockImplementation(async (id: string, body: Partial<Branch>) => {
    list = list.map((branch) => (branch.id === id ? { ...branch, ...body } : branch));

    return list.find((branch) => branch.id === id);
  });
  deleteBranch.mockImplementation(async (id: string) => {
    list = list.filter((branch) => branch.id !== id);

    return { items: list.slice() };
  });
});

describe('the branches screen', () => {
  it('shows each place with what a client needs to reach it', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Local principal' })).toBeVisible();
    expect(screen.getByText('La Unión, Tres Ríos, Frente a la plaza')).toBeVisible();
    expect(screen.getByText('2279 1234')).toBeVisible();
    expect(screen.getByText('Principal')).toBeVisible();
    // The permit is the chamber's, and the card says so.
    expect(screen.getByText('Patente municipal UNI-2025-0318')).toBeVisible();
    expect(screen.getByText('La patente solo la ve la Cámara.')).toBeVisible();
  });

  it('adds a branch from its popup', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Agregar sucursal' }));

    const dialog = within(screen.getByRole('dialog'));

    await user.type(dialog.getByLabelText('Nombre de la sucursal'), 'Sucursal Curridabat');
    await user.selectOptions(dialog.getByLabelText('Cantón'), '65f0c3a1b2c3d4e5f6a7b8ca');
    await user.type(dialog.getByLabelText('Distrito'), 'Granadilla');
    await user.type(dialog.getByLabelText('Dirección exacta'), '100 m sur del parque');
    await user.click(dialog.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(createBranch).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sucursal Curridabat',
          canton: '65f0c3a1b2c3d4e5f6a7b8ca',
          district: 'Granadilla',
          address: '100 m sur del parque',
        }),
      ),
    );
    expect(await screen.findByRole('heading', { name: 'Sucursal Curridabat' })).toBeVisible();
  });

  it('edits a branch and keeps what the popup never showed', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Editar' }));

    const dialog = within(screen.getByRole('dialog'));
    const address = dialog.getByLabelText('Dirección exacta');

    await user.clear(address);
    await user.type(address, 'Costado este de la iglesia');
    await user.click(dialog.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(updateBranch).toHaveBeenCalledWith(
        PRINCIPAL.id,
        expect.objectContaining({
          address: 'Costado este de la iglesia',
          municipalPermit: 'UNI-2025-0318',
        }),
      ),
    );
  });

  // The chamber affiliates a place, so a member always keeps one.
  it('does not offer to close the only branch it has', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Local principal' });

    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
    expect(screen.getByText('Necesitás al menos una sucursal.')).toBeVisible();
  });

  it('closes a branch when there is another one left', async () => {
    const user = userEvent.setup();
    list = [PRINCIPAL, SEGUNDA];
    renderPage();

    await screen.findByRole('heading', { name: 'Sucursal Curridabat' });

    const [, segunda] = screen.getAllByRole('button', { name: 'Eliminar' });

    await user.click(segunda);

    const dialog = within(screen.getByRole('dialog'));

    await user.click(dialog.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(deleteBranch).toHaveBeenCalledWith(SEGUNDA.id));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Sucursal Curridabat' })).toBeNull(),
    );
  });
});
