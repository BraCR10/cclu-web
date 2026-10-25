import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { AdministratorsPage } from '@/modules/admin/components/AdministratorsPage';
import type { Administrator } from '@/modules/admin/api/administrators';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readAdministrators = vi.fn();
const inviteAdministrator = vi.fn();
const resendInvitation = vi.fn();
const setAdministratorStatus = vi.fn();

vi.mock('@/modules/admin/api/administrators', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/administrators')>()),
  readAdministrators: () => readAdministrators(),
  inviteAdministrator: (draft: unknown) => inviteAdministrator(draft),
  resendInvitation: (id: string) => resendInvitation(id),
  setAdministratorStatus: (id: string, status: string) => setAdministratorStatus(id, status),
}));

// Who is looking, which decides whose row offers no switch.
const viewer = vi.hoisted(() => ({
  current: { id: 'a0', role: 'admin', email: 'yo@camaralaunion.cr', displayName: 'Yo Mismo' },
}));

vi.mock('@/shared/hooks/useCurrentAccount', () => ({
  useCurrentAccount: () => ({ status: 'ready', account: viewer.current }),
}));

const mariana: Administrator = {
  id: 'a1',
  name: 'Mariana Solís',
  email: 'mariana@camaralaunion.cr',
  status: 'active',
  invitationExpiresAt: null,
  createdAt: '2026-01-04T10:00:00.000Z',
};

const invited: Administrator = {
  id: 'a2',
  name: 'Diego Ramírez',
  email: 'diego@camaralaunion.cr',
  status: 'invitation_pending',
  invitationExpiresAt: '2026-02-11T10:00:00.000Z',
  createdAt: '2026-02-04T10:00:00.000Z',
};

function renderPanel() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <AdministratorsPage />
    </ToastProvider>,
  );
}

describe('AdministratorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewer.current = { ...viewer.current, id: 'a0' };
    readAdministrators.mockResolvedValue({ items: [mariana, invited] });
  });

  it('shows each administrator with the state of their invitation', async () => {
    renderPanel();

    expect((await screen.findAllByText('Mariana Solís')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invitación pendiente').length).toBeGreaterThan(0);
  });

  it('invites an administrator by name and address and confirms with a toast', async () => {
    const person = userEvent.setup();
    const created: Administrator = { ...invited, id: 'a3', name: 'Ana Vega' };
    inviteAdministrator.mockResolvedValue(created);

    renderPanel();

    await screen.findAllByText('Mariana Solís');
    await person.click(screen.getAllByRole('button', { name: 'Invitar administrador' })[0]);

    const dialog = await screen.findByRole('dialog');
    await person.type(within(dialog).getByLabelText('Nombre completo'), 'Ana Vega');
    await person.type(within(dialog).getByLabelText('Correo electrónico'), 'ana@camaralaunion.cr');
    await person.click(within(dialog).getByRole('button', { name: 'Enviar invitación' }));

    await waitFor(() => {
      expect(inviteAdministrator).toHaveBeenCalledWith({
        name: 'Ana Vega',
        email: 'ana@camaralaunion.cr',
      });
    });
    expect((await screen.findAllByText('Invitación enviada')).length).toBeGreaterThan(0);
  });

  it('resends the invitation of a pending administrator with a toast', async () => {
    const person = userEvent.setup();
    resendInvitation.mockResolvedValue({
      ...invited,
      invitationExpiresAt: '2026-02-18T10:00:00.000Z',
    });

    renderPanel();

    await screen.findAllByText('Mariana Solís');
    await person.click(screen.getAllByRole('button', { name: 'Reenviar invitación' })[0]);

    await waitFor(() => expect(resendInvitation).toHaveBeenCalledWith('a2'));
    expect((await screen.findAllByText('Invitación reenviada')).length).toBeGreaterThan(0);
  });

  it('inactivates an administrator and confirms with a toast', async () => {
    const person = userEvent.setup();
    setAdministratorStatus.mockResolvedValue({ ...mariana, status: 'inactive' });

    renderPanel();

    await screen.findAllByText('Mariana Solís');
    await person.click(screen.getAllByRole('button', { name: 'Inactivar' })[0]);

    await waitFor(() => expect(setAdministratorStatus).toHaveBeenCalledWith('a1', 'inactive'));
    expect((await screen.findAllByText('Administrador inactivado')).length).toBeGreaterThan(0);
  });

  it('reactivates an inactive administrator', async () => {
    const person = userEvent.setup();
    const inactive: Administrator = { ...mariana, status: 'inactive' };

    readAdministrators.mockResolvedValue({ items: [inactive] });
    setAdministratorStatus.mockResolvedValue(mariana);

    renderPanel();

    await screen.findAllByText('Mariana Solís');
    await person.click(screen.getAllByRole('button', { name: 'Reactivar' })[0]);

    await waitFor(() => expect(setAdministratorStatus).toHaveBeenCalledWith('a1', 'active'));
    expect((await screen.findAllByText('Administrador reactivado')).length).toBeGreaterThan(0);
  });

  // The API refuses it, so the screen does not offer it: the rule is said before
  // the click rather than after it.
  it('offers no switch on the row of the administrator who is looking', async () => {
    viewer.current = { ...viewer.current, id: 'a1' };

    renderPanel();

    await screen.findAllByText('Mariana Solís');

    expect(screen.getAllByText('Tu cuenta').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Inactivar' })).toBeNull();
  });
});
