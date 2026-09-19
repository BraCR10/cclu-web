import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationInbox } from '@/modules/admin/components/ApplicationInbox';
import { ApiError } from '@/shared/api/request';
import type {
  ApplicationDecision,
  DecidedApplication,
  PendingApplication,
} from '@/modules/admin/api/applications';

function application(overrides: Partial<PendingApplication> = {}): PendingApplication {
  return {
    _id: '65f0c3a1b2c3d4e5f6a7b8c9',
    email: 'comercio@example.cr',
    phone: '88888888',
    location: 'Centro',
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3101234567',
    businessName: 'Panadería La Unión',
    businessDescription: 'Panadería artesanal.',
    createdAt: '2026-09-15T12:00:00.000Z',
    canton: { _id: 'c1', name: 'La Unión', province: 'Cartago' },
    sector: { _id: 's1', name: 'Alimentos' },
    ...overrides,
  };
}

function decidedApplication(overrides: Partial<DecidedApplication> = {}): DecidedApplication {
  return {
    _id: '65f0c3a1b2c3d4e5f6a7b8d0',
    businessName: 'Taller Los Ángeles',
    email: 'taller@example.cr',
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3101999888',
    applicationStatus: 'rejected',
    statusReason: 'La cédula jurídica no se pudo verificar.',
    reviewedAt: '2026-09-18T15:30:00.000Z',
    createdAt: '2026-09-10T12:00:00.000Z',
    reviewedBy: { _id: 'a1', email: 'admin@cclu.cr' },
    sector: { _id: 's2', name: 'Servicios' },
    ...overrides,
  };
}

const approvedDecision: ApplicationDecision = {
  applicationStatus: 'approved',
  memberCode: 'MA7K2Q4',
  reviewedAt: '2026-09-19T12:00:00.000Z',
};

const rejectedDecision: ApplicationDecision = {
  applicationStatus: 'rejected',
  statusReason: 'Cédula no verificable.',
  reviewedAt: '2026-09-19T12:00:00.000Z',
};

function renderInbox(overrides: Parameters<typeof ApplicationInbox>[0] = {}) {
  const loadApplications = overrides.loadApplications ?? vi.fn(async () => [application()]);
  const loadDecided = overrides.loadDecided ?? vi.fn(async () => []);
  const approve = overrides.approve ?? vi.fn(async () => approvedDecision);
  const reject = overrides.reject ?? vi.fn(async () => rejectedDecision);

  render(
    <ApplicationInbox
      loadApplications={loadApplications}
      loadDecided={loadDecided}
      approve={approve}
      reject={reject}
    />,
  );

  return { loadApplications, loadDecided, approve, reject, user: userEvent.setup() };
}

describe('ApplicationInbox', () => {
  it('shows each pending application with what is needed to judge it', async () => {
    renderInbox();

    expect(await screen.findByText('Panadería La Unión')).toBeTruthy();
    expect(screen.getByText('comercio@example.cr')).toBeTruthy();
    expect(screen.getByText('3101234567')).toBeTruthy();
    expect(screen.getByText('Alimentos')).toBeTruthy();
  });

  it('counts each state on its own tab', async () => {
    renderInbox({
      loadDecided: vi.fn(async () => [
        decidedApplication(),
        decidedApplication({ _id: 'x1', applicationStatus: 'approved', memberCode: 'MB3N5R8' }),
      ]),
    });

    const pendingTab = await screen.findByRole('tab', { name: /Pendientes/ });
    const approvedTab = screen.getByRole('tab', { name: /Aprobadas/ });
    const rejectedTab = screen.getByRole('tab', { name: /Rechazadas/ });

    expect(pendingTab.textContent).toContain('1');
    expect(approvedTab.textContent).toContain('1');
    expect(rejectedTab.textContent).toContain('1');
  });

  it('shows a rejected application with its reason, date and who decided', async () => {
    const { user } = renderInbox({ loadDecided: vi.fn(async () => [decidedApplication()]) });

    await user.click(await screen.findByRole('tab', { name: /Rechazadas/ }));

    expect(await screen.findByText('Taller Los Ángeles')).toBeTruthy();
    expect(screen.getByText('La cédula jurídica no se pudo verificar.')).toBeTruthy();
    expect(screen.getByText('admin@cclu.cr')).toBeTruthy();
    expect(screen.getByText('18 de septiembre de 2026')).toBeTruthy();
  });

  it('shows an approved application with its member code', async () => {
    const { user } = renderInbox({
      loadDecided: vi.fn(async () => [
        decidedApplication({
          applicationStatus: 'approved',
          memberCode: 'MA7K2Q4',
          statusReason: undefined,
        }),
      ]),
    });

    await user.click(await screen.findByRole('tab', { name: /Aprobadas/ }));

    expect(await screen.findByText('M-A7K2-Q4')).toBeTruthy();
  });

  it('says so plainly when a tab has nothing in it', async () => {
    renderInbox({ loadApplications: vi.fn(async () => []) });

    expect(await screen.findByText('No hay solicitudes pendientes.')).toBeTruthy();
  });

  it('approves, takes the card away and announces the assigned code', async () => {
    const { approve, user } = renderInbox();

    await user.click(await screen.findByRole('button', { name: 'Aprobar' }));

    expect(approve).toHaveBeenCalledWith('65f0c3a1b2c3d4e5f6a7b8c9');
    expect(await screen.findByText('Código de agremiado M-A7K2-Q4')).toBeTruthy();
    expect(screen.getByText('Se aprobó Panadería La Unión')).toBeTruthy();
  });

  it('will not send a rejection without a reason', async () => {
    const { reject, user } = renderInbox();

    await user.click(await screen.findByRole('button', { name: 'Rechazar' }));

    const confirm = screen.getByRole('button', { name: 'Confirmar rechazo' }) as HTMLButtonElement;

    expect(confirm.disabled).toBe(true);
    expect(reject).not.toHaveBeenCalled();
  });

  it('sends the rejection reason once it was written', async () => {
    const { reject, user } = renderInbox();

    await user.click(await screen.findByRole('button', { name: 'Rechazar' }));
    await user.type(screen.getByLabelText('Motivo del rechazo'), '  Cédula no verificable.  ');
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    expect(reject).toHaveBeenCalledWith('65f0c3a1b2c3d4e5f6a7b8c9', 'Cédula no verificable.');
    expect(await screen.findByText('Se rechazó Panadería La Unión')).toBeTruthy();
  });

  it('reports a decision someone else made first without blaming the administrator', async () => {
    const approve = vi.fn(async (): Promise<ApplicationDecision> => {
      throw new ApiError(409, 'Conflict');
    });
    const { user } = renderInbox({ approve });

    await user.click(await screen.findByRole('button', { name: 'Aprobar' }));

    expect(await screen.findByText(/Otra persona ya decidió/)).toBeTruthy();
    expect(screen.getByText('No se completó la decisión')).toBeTruthy();
  });

  it('reads the three counts again from the database after every decision', async () => {
    const { loadApplications, loadDecided, user } = renderInbox();

    await user.click(await screen.findByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(loadApplications).toHaveBeenCalledTimes(2));
    expect(loadDecided).toHaveBeenCalledTimes(2);
  });

  it('lets an announcement be dismissed before it leaves on its own', async () => {
    const { user } = renderInbox();

    await user.click(await screen.findByRole('button', { name: 'Aprobar' }));
    await screen.findByText('Se aprobó Panadería La Unión');

    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    await waitFor(() => expect(screen.queryByText('Se aprobó Panadería La Unión')).toBeNull());
  });

  it('offers another attempt when the lists could not be read', async () => {
    const loadApplications = vi
      .fn<() => Promise<PendingApplication[]>>()
      .mockRejectedValueOnce(new ApiError(500, 'Server Error'))
      .mockResolvedValueOnce([application()]);
    const { user } = renderInbox({ loadApplications });

    await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Panadería La Unión')).toBeTruthy();
  });
});
