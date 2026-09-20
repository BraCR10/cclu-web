import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CredentialsForm, FORGOTTEN_PASSWORD_PATH } from '@/shared/components/CredentialsForm';
import { MESSAGES } from '@/shared/config/messages';

function renderForm() {
  const signIn = vi.fn(async () => undefined);
  const onSignedIn = vi.fn();

  render(<CredentialsForm onSignedIn={onSignedIn} signIn={signIn} />);

  return { signIn, onSignedIn, user: userEvent.setup() };
}

function submit(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('CredentialsForm', () => {
  // Somebody who cannot get in is the person most likely to be looking for it,
  // so the way out is on the screen that refused them.
  it('offers the way to recover a password from the sign in screen itself', () => {
    renderForm();

    const link = screen.getByRole('link', { name: '¿Olvidó su contraseña?' });

    expect(link.getAttribute('href')).toBe(FORGOTTEN_PASSWORD_PATH);
  });

  // The button takes the press and says what is missing. Disabled, it leaves
  // the person guessing which rule they broke.
  it('names the missing fields rather than refusing to be pressed', async () => {
    const { signIn, user } = renderForm();

    await submit(user);

    expect(document.getElementById('email-error')?.textContent).toContain(MESSAGES.required);
    expect(document.getElementById('password-error')?.textContent).toContain(MESSAGES.required);
    expect(signIn).not.toHaveBeenCalled();
  });

  it('refuses an address that is not one before asking the server', async () => {
    const { signIn, user } = renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), 'socio');
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta.1');
    await submit(user);

    expect(document.getElementById('email-error')?.textContent).toContain('nombre@dominio.com');
    expect(signIn).not.toHaveBeenCalled();
  });

  it('trims the address before sending it', async () => {
    const { signIn, user } = renderForm();

    await user.type(screen.getByLabelText('Correo electrónico'), '  socio@example.cr  ');
    await user.type(screen.getByLabelText('Contraseña'), 'Secreta.1');
    await submit(user);

    expect(signIn).toHaveBeenCalledWith({ email: 'socio@example.cr', password: 'Secreta.1' });
  });
});
