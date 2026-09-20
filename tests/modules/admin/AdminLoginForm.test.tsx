import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLoginForm } from '@/modules/admin/components/AdminLoginForm';
import { ApiError } from '@/shared/api/request';

function renderForm(signIn: (credentials: { email: string; password: string }) => Promise<void>) {
  const onSignedIn = vi.fn();

  render(<AdminLoginForm onSignedIn={onSignedIn} signIn={signIn} />);

  return { onSignedIn, user: userEvent.setup() };
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Correo electrónico'), 'admin@cclu.cr');
  await user.type(screen.getByLabelText('Contraseña'), 'una-contrasena');
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('AdminLoginForm', () => {
  it('hands the credentials over and reports the session opened', async () => {
    const signIn = vi.fn(async () => {});
    const { onSignedIn, user } = renderForm(signIn);

    await fillAndSubmit(user);

    expect(signIn).toHaveBeenCalledWith({ email: 'admin@cclu.cr', password: 'una-contrasena' });
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledOnce());
  });

  it('never says whether the address is an account', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError(401, 'Unauthorized');
    });
    const { onSignedIn, user } = renderForm(signIn);

    await fillAndSubmit(user);

    // A refusal the API sent, not one a field could have caught, so it is
    // reported in the corner rather than wedged into the form.
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeTruthy();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('explains a rate limit instead of blaming the credentials', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError(429, 'Too Many Requests');
    });
    const { user } = renderForm(signIn);

    await fillAndSubmit(user);

    expect(await screen.findByText(/Demasiados intentos/)).toBeTruthy();
  });

  it('separates a server that broke from credentials that were wrong', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError(500, 'Internal Server Error');
    });
    const { user } = renderForm(signIn);

    await fillAndSubmit(user);

    expect(await screen.findByText(/No fue posible iniciar sesión/)).toBeTruthy();
  });

  it('lets the person try again after a refusal', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError(401, 'Unauthorized');
    });
    const { user } = renderForm(signIn);

    await fillAndSubmit(user);
    await screen.findByText('Correo o contraseña incorrectos.');

    const button = screen.getByRole('button', { name: 'Ingresar' }) as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  // The notice leaves on its own, but somebody who has read it should not have
  // to wait for it.
  it('lets the refusal be dismissed', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError(401, 'Unauthorized');
    });
    const { user } = renderForm(signIn);

    await fillAndSubmit(user);
    await screen.findByText('Correo o contraseña incorrectos.');

    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(screen.queryByText('Correo o contraseña incorrectos.')).toBeNull();
  });
});
