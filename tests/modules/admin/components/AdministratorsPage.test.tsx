import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { AdministratorsPage } from '@/modules/admin/components/AdministratorsPage';
import { AdminInvitationPage } from '@/modules/admin/components/AdminInvitationPage';
import type { Administrator } from '@/modules/admin/api/administrators';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readAdministrators = vi.fn();
const inviteAdministrator = vi.fn();
const resendInvitation = vi.fn();
const setAdministratorStatus = vi.fn();
const readInvitation = vi.fn();
const acceptInvitation = vi.fn();

vi.mock('@/modules/admin/api/administrators', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/administrators')>()),
  readAdministrators: () => readAdministrators(),
  inviteAdministrator: (draft: unknown) => inviteAdministrator(draft),
  resendInvitation: (id: string) => resendInvitation(id),
  setAdministratorStatus: (id: string, status: string) => setAdministratorStatus(id, status),
  readInvitation: (token: string) => readInvitation(token),
  acceptInvitation: (token: string, password: string) => acceptInvitation(token, password),
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
});

describe('AdminInvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the register with the address the invitation went to, fixed', async () => {
    readInvitation.mockResolvedValue({ name: 'Diego Ramírez', email: 'diego@camaralaunion.cr' });

    renderWithIntl(<AdminInvitationPage token={'a'.repeat(64)} />);

    const email = await screen.findByLabelText('Correo electrónico');
    expect(email).toHaveValue('diego@camaralaunion.cr');
    expect(email).toBeDisabled();
    expect(readInvitation).toHaveBeenCalledWith('a'.repeat(64));
  });

  it('sets the password, activates the account and burns the link', async () => {
    const person = userEvent.setup();
    readInvitation.mockResolvedValue({ name: 'Diego Ramírez', email: 'diego@camaralaunion.cr' });
    acceptInvitation.mockResolvedValue({ email: 'diego@camaralaunion.cr' });

    renderWithIntl(<AdminInvitationPage token={'b'.repeat(64)} />);

    await screen.findByLabelText('Correo electrónico');
    await person.type(screen.getByLabelText('Contraseña'), 'Camara2026!');
    await person.click(screen.getByRole('button', { name: 'Activar mi cuenta' }));

    await waitFor(() => {
      expect(acceptInvitation).toHaveBeenCalledWith('b'.repeat(64), 'Camara2026!');
    });
    expect(await screen.findByText(/Su cuenta está activa/)).toBeInTheDocument();
  });

  it('says the link no longer works when it came back as invalid', async () => {
    readInvitation.mockRejectedValue({ status: 404, code: 'invalid_code' });

    renderWithIntl(<AdminInvitationPage token={'c'.repeat(64)} />);

    expect(await screen.findByText('Este enlace ya no sirve.')).toBeInTheDocument();
  });
});
