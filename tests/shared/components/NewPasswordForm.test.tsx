import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewPasswordForm } from '@/shared/components/NewPasswordForm';
import { MESSAGES } from '@/shared/config/messages';

const TOKEN = 'a'.repeat(64);

function renderForm(overrides: Partial<Parameters<typeof NewPasswordForm>[0]> = {}) {
  const complete = overrides.complete ?? vi.fn(async () => ({ changed: true as const }));

  render(
    <NewPasswordForm
      token={TOKEN}
      check={overrides.check ?? (async () => ({ valid: true as const, minutesValid: 30 }))}
      complete={complete}
    />,
  );

  return { complete, user: userEvent.setup() };
}

function submit(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Establecer la contraseña' }));
}

describe('NewPasswordForm', () => {
  // Asked before the form appears, so nobody chooses a password only to be told
  // afterwards that the link had already expired.
  it('says a spent link is spent instead of showing a form that cannot work', async () => {
    renderForm({
      check: async () => {
        throw new Error('404');
      },
    });

    expect(await screen.findByText('Este enlace ya no sirve')).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña nueva')).toBeNull();
  });

  // The link already proved the account is theirs; asking again for what they
  // came here because they could not produce would be absurd.
  it('never asks for the password the person is here to replace', async () => {
    renderForm();

    expect(await screen.findByLabelText('Contraseña nueva')).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña actual')).toBeNull();
  });

  it('refuses a password the rules reject without asking the server', async () => {
    const { complete, user } = renderForm();

    await user.type(await screen.findByLabelText('Contraseña nueva'), 'corta');
    await submit(user);

    await waitFor(() =>
      expect(document.getElementById('newPassword-error')?.textContent).toContain(
        MESSAGES.password_too_short,
      ),
    );
    expect(complete).not.toHaveBeenCalled();
  });

  it('catches a confirmation that does not match', async () => {
    const { complete, user } = renderForm();

    await user.type(await screen.findByLabelText('Contraseña nueva'), 'Secreta.1');
    await user.type(screen.getByLabelText('Confirme la contraseña'), 'Secreta.2');
    await submit(user);

    await waitFor(() =>
      expect(document.getElementById('passwordConfirmation-error')?.textContent).toContain(
        MESSAGES.confirmation_mismatch,
      ),
    );
    expect(complete).not.toHaveBeenCalled();
  });

  it('sets the password and says the link is now spent', async () => {
    const { complete, user } = renderForm();

    await user.type(await screen.findByLabelText('Contraseña nueva'), 'Secreta.1');
    await user.type(screen.getByLabelText('Confirme la contraseña'), 'Secreta.1');
    await submit(user);

    await waitFor(() => expect(complete).toHaveBeenCalledWith(TOKEN, 'Secreta.1'));
    expect(await screen.findByText('Su contraseña quedó cambiada')).toBeTruthy();
  });
});
