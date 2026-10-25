import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { ApiError } from '@/shared/api/apiError';
import { ActivitiesPage } from '@/modules/admin/components/ActivitiesPage';
import type { CatalogActivity } from '@/modules/admin/api/activities';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readActivities = vi.fn();
const createActivity = vi.fn();
const updateActivity = vi.fn();
const removeActivity = vi.fn();

vi.mock('@/modules/admin/api/activities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/activities')>()),
  readActivities: (filter: unknown) => readActivities(filter),
  createActivity: (body: unknown) => createActivity(body),
  updateActivity: (id: string, body: unknown) => updateActivity(id, body),
  removeActivity: (id: string) => removeActivity(id),
}));

const cafeterias: CatalogActivity = {
  id: 'a1',
  name: 'Cafeterías',
  status: 'active',
  members: 12,
};

const textiles: CatalogActivity = {
  id: 'a2',
  name: 'Textiles',
  status: 'pending',
  members: 0,
};

function renderPage() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <ActivitiesPage />
    </ToastProvider>,
  );
}

describe('ActivitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readActivities.mockResolvedValue({
      items: [cafeterias, textiles],
      counts: { active: 1, pending: 1, inactive: 0 },
    });
  });

  it('shows each activity with its state and how many members carry it', async () => {
    renderPage();

    expect((await screen.findAllByText('Cafeterías')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('12 agremiados').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Por aceptar').length).toBeGreaterThan(0);
  });

  // Deleting is only offered where it can work; the rest are retired.
  it('offers Eliminar only for the activity nobody carries', async () => {
    renderPage();

    await screen.findAllByText('Cafeterías');

    const rows = screen.getAllByRole('row');

    const cafeteriaRow = rows.find((row) => within(row).queryByText('Cafeterías') !== null);
    const textileRow = rows.find((row) => within(row).queryByText('Textiles') !== null);

    expect(cafeteriaRow).toBeDefined();
    expect(textileRow).toBeDefined();
    expect(
      within(cafeteriaRow as HTMLElement).queryByRole('button', { name: 'Eliminar' }),
    ).toBeNull();
    expect(
      within(textileRow as HTMLElement).getByRole('button', { name: 'Eliminar' }),
    ).toBeInTheDocument();
  });

  it('accepting a pending activity is a status change confirmed with a toast', async () => {
    const person = userEvent.setup();
    updateActivity.mockResolvedValue({ ...textiles, status: 'active' });

    renderPage();

    await screen.findAllByText('Textiles');
    await person.click(screen.getAllByRole('button', { name: 'Aceptar' })[0]);

    await waitFor(() => expect(updateActivity).toHaveBeenCalledWith('a2', { status: 'active' }));
    expect((await screen.findAllByText('Actividad aceptada')).length).toBeGreaterThan(0);
  });

  it('adds an activity by name and confirms with a toast', async () => {
    const person = userEvent.setup();
    createActivity.mockResolvedValue({
      id: 'a3',
      name: 'Artesanías',
      status: 'active',
      members: 0,
    });

    renderPage();

    await screen.findAllByText('Cafeterías');
    await person.click(screen.getByRole('button', { name: 'Agregar actividad' }));

    const dialog = await screen.findByRole('dialog');
    await person.type(within(dialog).getByLabelText('Nombre de la actividad'), 'Artesanías');
    await person.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(createActivity).toHaveBeenCalledWith({ name: 'Artesanías' }));
    expect((await screen.findAllByText('Actividad agregada')).length).toBeGreaterThan(0);
  });

  it('a name the catalog already has is shown on the field, not as a toast', async () => {
    const person = userEvent.setup();
    createActivity.mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'activity_already_listed',
        field: 'name',
        message: 'The catalog already has that activity.',
      }),
    );

    renderPage();

    await screen.findAllByText('Cafeterías');
    await person.click(screen.getByRole('button', { name: 'Agregar actividad' }));

    const dialog = await screen.findByRole('dialog');
    await person.type(within(dialog).getByLabelText('Nombre de la actividad'), 'cafeterías');
    await person.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(
      await within(dialog).findByText('Ese nombre ya está en el catálogo.'),
    ).toBeInTheDocument();
  });
});
