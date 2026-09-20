import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordSection } from '@/shared/components/PasswordSection';
import { MESSAGES } from '@/shared/config/messages';
import { ApiError } from '@/shared/api/request';

function renderSection(requestLink = vi.fn(async () => ({ minutesValid: 30 }))) {
  render(<PasswordSection requestLink={requestLink} />);

  return { requestLink, user: userEvent.setup() };
}

function send(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));
}

describe('PasswordSection', () => {
  // The new password is set from the link, not here. Typing it on a screen
  // somebody walked away from is exactly what the link exists to avoid.
  it('never asks for the new password, only for the current one', () => {
    renderSection();

    expect(screen.getByLabelText('Contraseña actual')).toBeTruthy();
    expect(screen.queryByLabelText('Contraseña nueva')).toBeNull();
    expect(screen.queryByLabelText('Confirme la contraseña')).toBeNull();
  });

  it('asks the chamber for a link once the current password is given', async () => {
    const { requestLink, user } = renderSection();

    await user.type(screen.getByLabelText('Contraseña actual'), 'Secreta.1');
    await send(user);

    await waitFor(() => expect(requestLink).toHaveBeenCalledWith('Secreta.1'));
    expect(await screen.findByText('Le enviamos el enlace')).toBeTruthy();
  });

  it('says the field is empty rather than refusing to be pressed', async () => {
    const { requestLink, user } = renderSection();

    await send(user);

    await waitFor(() =>
      expect(document.getElementById('currentPassword-error')?.textContent).toContain(
        MESSAGES.required,
      ),
    );
    expect(requestLink).not.toHaveBeenCalled();
  });

  // A wrong current password is about that field, so it belongs beside it
  // rather than in a notice in the corner with everything else.
  it('puts a wrong current password beside the field it is about', async () => {
    const requestLink = vi.fn(async () => {
      throw new ApiError(401, 'Unauthorized', { code: 'invalid_current_password' });
    });
    const { user } = renderSection(requestLink);

    await user.type(screen.getByLabelText('Contraseña actual'), 'la-que-no-es');
    await send(user);

    await waitFor(() =>
      expect(document.getElementById('currentPassword-error')?.textContent).toContain(
        MESSAGES.invalid_current_password,
      ),
    );
  });

  it('forgets the password once the link is on its way', async () => {
    const { user } = renderSection();

    const field = screen.getByLabelText('Contraseña actual') as HTMLInputElement;

    await user.type(field, 'Secreta.1');
    await send(user);

    await screen.findByText('Le enviamos el enlace');
    expect(screen.queryByLabelText('Contraseña actual')).toBeNull();
  });
});
