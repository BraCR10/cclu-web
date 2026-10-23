import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { MyPublicationsPage } from '@/modules/marketplace/components/MyPublicationsPage';
import { PublicationFormPage } from '@/modules/marketplace/components/PublicationFormPage';
import type { OwnPublication } from '@/modules/marketplace/api/publications';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readOwnPublications = vi.fn();
const createPublication = vi.fn();
const setPublicationStatus = vi.fn();
const deletePublication = vi.fn();
const push = vi.fn();

vi.mock('@/modules/marketplace/api/publications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/marketplace/api/publications')>()),
  readOwnPublications: (type: string, page: number) => readOwnPublications(type, page),
  createPublication: (draft: unknown) => createPublication(draft),
  setPublicationStatus: (id: string, status: string) => setPublicationStatus(id, status),
  deletePublication: (id: string) => deletePublication(id),
}));

vi.mock('@/shared/api/catalogs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api/catalogs')>()),
  readActivities: async () => [{ _id: '65f0c3a1b2c3d4e5f6a7b8cb', name: 'Cafeterías' }],
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const ACTIVE: OwnPublication = {
  id: '65f0c3a1b2c3d4e5f6a7b8d1',
  type: 'product',
  title: 'Café de altura 340 g',
  description: 'Café en grano de San Juan, tueste medio',
  price: 5500,
  imageUrl: null,
  category: null,
  percentage: null,
  condition: null,
  startsAt: null,
  endsAt: null,
  status: 'active',
  inactiveReason: null,
  publishedAt: '2026-10-20T15:00:00.000Z',
  updatedAt: '2026-10-21T15:00:00.000Z',
};

const TAKEN_DOWN: OwnPublication = {
  ...ACTIVE,
  id: '65f0c3a1b2c3d4e5f6a7b8d2',
  title: 'Degustación de café con licor',
  status: 'inactive',
  inactiveReason: 'la imagen no corresponde al producto',
};

function pageOf(items: OwnPublication[], canPublish = true) {
  return { items, page: 1, pageSize: 10, total: items.length, pageCount: 1, canPublish };
}

function renderList() {
  return renderWithIntl(
    <ToastProvider>
      <MyPublicationsPage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readOwnPublications.mockResolvedValue(pageOf([ACTIVE]));
  createPublication.mockResolvedValue(ACTIVE);
});

describe('my publications', () => {
  // The prototype's locked state names the plans that unlock publishing.
  it('explains what a paid plan unlocks when the member has none', async () => {
    readOwnPublications.mockResolvedValue(pageOf([], false));

    renderList();

    expect(await screen.findByText('Publicar está disponible con un plan pagado')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver planes' })).toHaveAttribute(
      'href',
      '/member/membership',
    );
  });

  it('lists a publication with its price and how to take it down', async () => {
    renderList();

    expect((await screen.findAllByText('Café de altura 340 g'))[0]).toBeVisible();
    expect(screen.getAllByText('₡5.500')[0]).toBeVisible();
    expect(screen.getAllByText('Activo')[0]).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Desactivar Café de altura 340 g' })[0],
    ).toBeVisible();
  });

  // A publication the chamber took down says why, and the only thing the member
  // can still do with it is delete it.
  it('shows the chamber reason and offers only deleting it', async () => {
    readOwnPublications.mockResolvedValue(pageOf([ACTIVE, TAKEN_DOWN]));

    renderList();

    await screen.findAllByText('Degustación de café con licor');

    expect(
      screen.getAllByText(
        'Inactivada por la Cámara · Motivo: la imagen no corresponde al producto',
      )[0],
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reactivar Degustación de café con licor' }),
    ).toBeNull();
    expect(
      screen.getAllByRole('button', { name: 'Eliminar Degustación de café con licor' })[0],
    ).toBeVisible();
  });
});

describe('the publication form', () => {
  it('asks a discount for its percentage and condition', async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <ToastProvider>
        <PublicationFormPage />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('radio', { name: 'Descuento' }));

    expect(screen.getByLabelText('Porcentaje de descuento')).toBeVisible();
    expect(screen.getByLabelText('Condición')).toBeVisible();
    expect(screen.queryByLabelText('Precio (opcional)')).toBeNull();
  });

  it('publishes what the member wrote and goes back to the list', async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <ToastProvider>
        <PublicationFormPage />
      </ToastProvider>,
    );

    await user.type(screen.getByLabelText('Nombre'), 'Café de altura 340 g');
    await user.type(screen.getByLabelText('Descripción'), 'Tueste medio.');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() =>
      expect(createPublication).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'product', title: 'Café de altura 340 g' }),
      ),
    );
    expect(push).toHaveBeenCalledWith('/member/publications');
  });
});
