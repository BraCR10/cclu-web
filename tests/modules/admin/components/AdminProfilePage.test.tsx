import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { ApiError } from '@/shared/api/apiError';
import { AdminProfilePage } from '@/modules/admin/components/AdminProfilePage';
import type { AdminProfile } from '@/modules/admin/api/profile';
import { renderWithIntl } from '../../../support/renderWithIntl';

const readAdminProfile = vi.fn();
const updateAdminProfile = vi.fn();
const changeOwnPassword = vi.fn();

vi.mock('@/modules/admin/api/profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/profile')>()),
  readAdminProfile: () => readAdminProfile(),
  updateAdminProfile: (body: unknown) => updateAdminProfile(body),
  changeOwnPassword: (body: unknown) => changeOwnPassword(body),
}));

const mariana: AdminProfile = {
  id: 'a1',
  name: 'Mariana Solís',
  email: 'mariana@camaralaunion.cr',
  accountStatus: 'active',
};

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <AdminProfilePage />
    </ToastProvider>,
  );
}

describe('AdminProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readAdminProfile.mockResolvedValue(mariana);
  });

  it('shows the account with the address fixed and the state as it is', async () => {
    renderPage();

    expect(await screen.findByLabelText('Nombre completo')).toHaveValue('Mariana Solís');

    const email = screen.getByLabelText('Correo electrónico');
    expect(email).toHaveValue('mariana@camaralaunion.cr');
    expect(email).toBeDisabled();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('saves the name and confirms with a toast', async () => {
    const person = userEvent.setup();
    updateAdminProfile.mockResolvedValue({ ...mariana, name: 'Mariana Solís Vargas' });

    renderPage();

    const name = await screen.findByLabelText('Nombre completo');
    await person.clear(name);
    await person.type(name, 'Mariana Solís Vargas');
    await person.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    await waitFor(() => {
      expect(updateAdminProfile).toHaveBeenCalledWith({ name: 'Mariana Solís Vargas' });
    });
    expect(await screen.findByText('Nombre guardado')).toBeInTheDocument();
  });

  it('changes the password and empties both fields', async () => {
    const person = userEvent.setup();
    changeOwnPassword.mockResolvedValue(mariana);

    renderPage();

    await screen.findByLabelText('Contraseña actual');
    await person.type(screen.getByLabelText('Contraseña actual'), 'Actual2026!');
    await person.type(screen.getByLabelText('Contraseña nueva'), 'Nueva2026!x');
    await person.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(changeOwnPassword).toHaveBeenCalledWith({
        currentPassword: 'Actual2026!',
        newPassword: 'Nueva2026!x',
      });
    });
    expect(await screen.findByText('Contraseña actualizada')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña nueva')).toHaveValue('');
  });

  it('a wrong current password is shown on its own field', async () => {
    const person = userEvent.setup();
    changeOwnPassword.mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'invalid_current_password',
        field: 'currentPassword',
        message: 'The current password is not the one on this account.',
      }),
    );

    renderPage();

    await screen.findByLabelText('Contraseña actual');
    await person.type(screen.getByLabelText('Contraseña actual'), 'Otra2026!');
    await person.type(screen.getByLabelText('Contraseña nueva'), 'Nueva2026!x');
    await person.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument();
  });

  // The three password rules are refused on the new password, so a banner would
  // be the wrong place and silence would be worse.
  it('a new password that breaks the rules is shown under its own field', async () => {
    const person = userEvent.setup();
    changeOwnPassword.mockRejectedValue(
      new ApiError({
        status: 400,
        code: 'password_too_short',
        field: 'newPassword',
        message: 'The password must be at least 10 characters.',
      }),
    );

    renderPage();

    await screen.findByLabelText('Contraseña actual');
    await person.type(screen.getByLabelText('Contraseña actual'), 'Actual2026!');
    await person.type(screen.getByLabelText('Contraseña nueva'), 'corta');
    await person.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(
      await screen.findByText('La contraseña debe tener al menos 10 caracteres.'),
    ).toBeInTheDocument();
  });

  // A refusal that names no field used to be swallowed entirely.
  it('a failure that is not about a field is shown as an alert', async () => {
    const person = userEvent.setup();
    updateAdminProfile.mockRejectedValue(
      new ApiError({ status: 500, code: 'internal_error', message: 'boom' }),
    );

    renderPage();

    await screen.findByLabelText('Nombre completo');
    await person.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    expect(await screen.findByText('Algo salió mal. Intentá de nuevo.')).toBeInTheDocument();
  });
});
