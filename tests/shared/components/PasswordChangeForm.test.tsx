import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordChangeForm } from '@/shared/components/PasswordChangeForm';
import { ApiError } from '@/shared/api/request';

function renderForm(overrides: Parameters<typeof PasswordChangeForm>[0] = {}) {
  const requestCode = overrides.requestCode ?? vi.fn(async () => ({ minutesValid: 15 }));
  const confirmChange = overrides.confirmChange ?? vi.fn(async () => ({ changed: true as const }));

  render(<PasswordChangeForm requestCode={requestCode} confirmChange={confirmChange} />);

  return { requestCode, confirmChange, user: userEvent.setup() };
}

async function askForCode(user: ReturnType<typeof userEvent.setup>, password = 'Actual123!') {
  await user.type(screen.getByLabelText('Contraseña actual'), password);
  await user.click(screen.getByRole('button', { name: 'Enviarme el código' }));
}

describe('PasswordChangeForm', () => {
  it('keeps the second step shut until a code was asked for', () => {
    renderForm();

    expect((screen.getByLabelText('Código de verificación') as HTMLInputElement).disabled).toBe(
      true,
    );
    expect((screen.getByLabelText('Nueva contraseña') as HTMLInputElement).disabled).toBe(true);
  });

  it('asks for the code with the current password and says how long it lasts', async () => {
    const { requestCode, user } = renderForm();

    await askForCode(user);

    expect(requestCode).toHaveBeenCalledWith('Actual123!');
    expect(await screen.findByText('Le enviamos un código')).toBeTruthy();
    await waitFor(() =>
      expect((screen.getByLabelText('Código de verificación') as HTMLInputElement).disabled).toBe(
        false,
      ),
    );
  });

  // The refusal belongs beside the field that caused it, not in a corner.
  it('puts a wrong current password on its own field', async () => {
    const requestCode = vi.fn(async () => {
      throw new ApiError(401, 'Unauthorized', { code: 'invalid_current_password' });
    });
    const { user } = renderForm({ requestCode });

    await askForCode(user, 'equivocada');

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeTruthy();
  });

  it('checks the new password here before spending the code', async () => {
    const { confirmChange, user } = renderForm();

    await askForCode(user);
    await user.type(screen.getByLabelText('Código de verificación'), '123456');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'abcdefgh');
    await user.type(screen.getByLabelText('Repita la nueva contraseña'), 'abcdefgh');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('La contraseña debe incluir al menos un número.')).toBeTruthy();
    expect(confirmChange).not.toHaveBeenCalled();
  });

  it('will not send a new password its repetition does not match', async () => {
    const { confirmChange, user } = renderForm();

    await askForCode(user);
    await user.type(screen.getByLabelText('Código de verificación'), '123456');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva456$');
    await user.type(screen.getByLabelText('Repita la nueva contraseña'), 'Otra789#');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeTruthy();
    expect(confirmChange).not.toHaveBeenCalled();
  });

  it('accepts only digits in the code box', async () => {
    const { user } = renderForm();

    await askForCode(user);
    await user.type(screen.getByLabelText('Código de verificación'), 'a1b2c3d4');

    expect((screen.getByLabelText('Código de verificación') as HTMLInputElement).value).toBe(
      '1234',
    );
  });

  it('puts a refused code on the code field', async () => {
    const confirmChange = vi.fn(async () => {
      throw new ApiError(400, 'Bad Request', { code: 'invalid_code' });
    });
    const { user } = renderForm({ confirmChange });

    await askForCode(user);
    await user.type(screen.getByLabelText('Código de verificación'), '999999');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva456$');
    await user.type(screen.getByLabelText('Repita la nueva contraseña'), 'Nueva456$');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(await screen.findByText(/El código no es válido/)).toBeTruthy();
  });

  it('confirms the change and stops offering the form', async () => {
    const { confirmChange, user } = renderForm();

    await askForCode(user);
    await user.type(screen.getByLabelText('Código de verificación'), '123456');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Nueva456$');
    await user.type(screen.getByLabelText('Repita la nueva contraseña'), 'Nueva456$');
    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    expect(confirmChange).toHaveBeenCalledWith('123456', 'Nueva456$');
    expect(await screen.findByText('Su contraseña quedó cambiada')).toBeTruthy();
    expect(screen.queryByLabelText('Nueva contraseña')).toBeNull();
  });

  it('explains a rate limit instead of blaming the password', async () => {
    const requestCode = vi.fn(async () => {
      throw new ApiError(429, 'Too Many Requests');
    });
    const { user } = renderForm({ requestCode });

    await askForCode(user);

    expect(await screen.findByText(/Demasiados intentos/)).toBeTruthy();
  });
});
