import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { AdminInvitationForm } from '@/modules/auth/components/AdminInvitationForm';
import { renderWithIntl } from '../../../support/renderWithIntl';

const readAdminInvitation = vi.fn();
const acceptAdminInvitation = vi.fn();
const signIn = vi.fn();
const replace = vi.fn();

vi.mock('@/modules/auth/api/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/auth/api/auth')>()),
  readAdminInvitation: (token: string) => readAdminInvitation(token),
  acceptAdminInvitation: (token: string, password: string) =>
    acceptAdminInvitation(token, password),
  signIn: (request: unknown) => signIn(request),
}));

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const TOKEN = 'a'.repeat(64);

const invitation = {
  name: 'Sofía Brenes',
  email: 'sofia@camaralaunion.com',
  expiresAt: '2026-10-30T15:00:00.000Z',
};

function renderForm() {
  return renderWithIntl(
    <ToastProvider>
      <AdminInvitationForm token={TOKEN} />
    </ToastProvider>,
  );
}

async function fillPassword(password: string) {
  await userEvent.type(await screen.findByLabelText('Contraseña'), password);
  await userEvent.type(screen.getByLabelText('Confirmar contraseña'), password);
}

describe('AdminInvitationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readAdminInvitation.mockResolvedValue(invitation);
    acceptAdminInvitation.mockResolvedValue({ email: invitation.email });
    signIn.mockResolvedValue(undefined);
  });

  it('opens the form with the address fixed and the day the link stops working', async () => {
    renderForm();

    expect(await screen.findByRole('heading', { name: 'Hola, Sofía' })).toBeTruthy();

    const email = screen.getByLabelText('Correo electrónico') as HTMLInputElement;

    expect(email.value).toBe('sofia@camaralaunion.com');
    // The address is what the invitation was sent to, so it is not editable.
    expect(email.readOnly).toBe(true);
    expect(screen.getByText('Es el correo de la invitación.')).toBeTruthy();
    expect(screen.getByText(/La invitación vence el/)).toBeTruthy();
    expect(readAdminInvitation).toHaveBeenCalledWith(TOKEN);
  });

  // A link that was used or ran out says so, rather than collecting a password
  // for an account it can no longer open.
  it('says the link is spent instead of offering the fields', async () => {
    readAdminInvitation.mockRejectedValue(new Error('invalid_code'));

    renderForm();

    expect(
      await screen.findByRole('heading', { name: 'El enlace no es válido o ya venció' }),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña')).toBeNull();
  });

  it('creates the password, signs the new administrator in and opens the panel', async () => {
    renderForm();

    await fillPassword('Camara2026!');
    await userEvent.click(screen.getByRole('button', { name: 'Crear contraseña y entrar' }));

    await waitFor(() => expect(acceptAdminInvitation).toHaveBeenCalledWith(TOKEN, 'Camara2026!'));
    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({
        role: 'admin',
        email: invitation.email,
        password: 'Camara2026!',
        rememberSession: false,
      }),
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin'));
  });

  // The password is set either way; if signing in fails, the form that offers
  // it is where the person lands, not a dead screen.
  it('falls back to the sign-in screen when the automatic entry fails', async () => {
    signIn.mockRejectedValue(new Error('refused'));

    renderForm();

    await fillPassword('Camara2026!');
    await userEvent.click(screen.getByRole('button', { name: 'Crear contraseña y entrar' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  });

  it('sends nothing while the password does not meet the rules', async () => {
    renderForm();

    await fillPassword('corta');
    await userEvent.click(screen.getByRole('button', { name: 'Crear contraseña y entrar' }));

    expect(acceptAdminInvitation).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
