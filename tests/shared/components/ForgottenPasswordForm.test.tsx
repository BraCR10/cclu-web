import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgottenPasswordForm } from '@/shared/components/ForgottenPasswordForm';
import { messageForFieldCode } from '@/shared/config/messages';

function renderForm(request = vi.fn(async () => ({ minutesValid: 30 }))) {
  render(<ForgottenPasswordForm request={request} />);

  return { request, user: userEvent.setup() };
}

function send(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));
}

describe('ForgottenPasswordForm', () => {
  // Told apart, this form becomes a way of asking the chamber who belongs to
  // it, and anyone can open it.
  it('never says whether the address is an account', async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText('Correo de su cuenta'), 'quiensea@example.cr');
    await send(user);

    const answer = await screen.findByText(/Si esa dirección corresponde a una cuenta/);

    expect(answer).toBeTruthy();
  });

  it('refuses an address that is not one before asking the server', async () => {
    const { request, user } = renderForm();

    await user.type(screen.getByLabelText('Correo de su cuenta'), 'socio');
    await send(user);

    await waitFor(() =>
      expect(document.getElementById('email-error')?.textContent).toContain(
        messageForFieldCode('email', 'invalid_format'),
      ),
    );
    expect(request).not.toHaveBeenCalled();
  });

  it('trims the address before sending it', async () => {
    const { request, user } = renderForm();

    await user.type(screen.getByLabelText('Correo de su cuenta'), '  socio@example.cr  ');
    await send(user);

    await waitFor(() => expect(request).toHaveBeenCalledWith('socio@example.cr'));
  });
});
