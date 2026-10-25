import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { ApplicationsPage } from '@/modules/admin/components/ApplicationsPage';
import { ApplicationDetailPage } from '@/modules/admin/components/ApplicationDetailPage';
import type { ApplicationDetail, ApplicationSummary } from '@/modules/admin/api/applications';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readApplications = vi.fn();
const readApplication = vi.fn();
const approveApplication = vi.fn();
const rejectApplication = vi.fn();
const requestChangesApplication = vi.fn();

vi.mock('@/modules/admin/api/applications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/applications')>()),
  readApplications: (view: string, query: unknown) => readApplications(view, query),
  readApplication: (id: string) => readApplication(id),
  approveApplication: (id: string) => approveApplication(id),
  rejectApplication: (id: string, reason: string) => rejectApplication(id, reason),
  requestChangesApplication: (id: string, reason: string) => requestChangesApplication(id, reason),
}));

const pending: ApplicationSummary = {
  _id: '65f0c3a1b2c3d4e5f6a7b8c9',
  businessName: 'Café La Unión',
  email: 'ana@cafelaunion.cr',
  memberType: 'business',
  identificationType: 'legal_entity_id',
  identificationNumber: '3-101-123456',
  activity: { _id: 'a1', name: 'Cafeterías' },
  applicationStatus: 'pending_review',
  createdAt: '2026-03-01T15:00:00.000Z',
};

const detail: ApplicationDetail = {
  ...pending,
  phone: '8888 8888',
  district: 'Tres Ríos',
  canton: { _id: 'c1', name: 'La Unión', province: 'Cartago' },
  location: '100 m norte del parque',
  certificationFileKey: 'certificacion.pdf',
  statusReason: null,
};

function page(items: ApplicationSummary[] = [pending]) {
  return {
    items,
    page: 1,
    pageSize: 10,
    total: items.length,
    pageCount: 1,
  };
}

function renderList() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <ApplicationsPage />
    </ToastProvider>,
  );
}

function renderDetail() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <ApplicationDetailPage memberId={pending._id} />
    </ToastProvider>,
  );
}

describe('ApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readApplications.mockResolvedValue(page());
  });

  it('lists what waits for a decision with the activity and the day it arrived', async () => {
    renderList();

    expect((await screen.findAllByText('Café La Unión')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cafeterías').length).toBeGreaterThan(0);
    expect(readApplications).toHaveBeenCalledWith('pending', expect.anything());
  });

  it('the decided tab asks the API for the decided list', async () => {
    const person = userEvent.setup();

    renderList();

    await screen.findAllByText('Café La Unión');
    await person.click(screen.getByLabelText('Decididas'));

    await waitFor(() =>
      expect(readApplications).toHaveBeenCalledWith('decided', expect.anything()),
    );
  });
});

describe('ApplicationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readApplication.mockResolvedValue(detail);
  });

  it('shows the application whole, with the documents behind links', async () => {
    renderDetail();

    expect(await screen.findByText('ana@cafelaunion.cr')).toBeInTheDocument();
    expect(screen.getByText('8888 8888')).toBeInTheDocument();
    expect(screen.getByText(/Tres Ríos/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Certificación de personería jurídica' }),
    ).toBeInTheDocument();
  });

  it('approving asks first, then says what was decided', async () => {
    const person = userEvent.setup();
    approveApplication.mockResolvedValue({ ...detail, applicationStatus: 'approved' });

    renderDetail();

    await screen.findByText('ana@cafelaunion.cr');
    await person.click(screen.getByRole('button', { name: 'Aprobar' }));

    const dialog = await screen.findByRole('dialog');
    await person.click(within(dialog).getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(approveApplication).toHaveBeenCalledWith(pending._id));
    expect(await screen.findByText('Solicitud aprobada')).toBeInTheDocument();
    expect((await screen.findAllByText('Aprobada')).length).toBeGreaterThan(0);
  });

  it('rejecting asks for a reason before anything is sent', async () => {
    const person = userEvent.setup();
    rejectApplication.mockResolvedValue({ ...detail, applicationStatus: 'rejected' });

    renderDetail();

    await screen.findByText('ana@cafelaunion.cr');
    await person.click(screen.getByRole('button', { name: 'Rechazar' }));

    const dialog = await screen.findByRole('dialog');
    await person.type(
      within(dialog).getByLabelText('Motivo'),
      'La certificación no corresponde a la razón social.',
    );
    await person.click(within(dialog).getByRole('button', { name: 'Rechazar' }));

    await waitFor(() =>
      expect(rejectApplication).toHaveBeenCalledWith(
        pending._id,
        'La certificación no corresponde a la razón social.',
      ),
    );
    expect(await screen.findByText('Solicitud rechazada')).toBeInTheDocument();
  });
});
