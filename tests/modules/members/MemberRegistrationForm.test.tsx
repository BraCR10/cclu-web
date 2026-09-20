import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemberRegistrationForm,
  REGISTRATION_SENT_PATH,
} from '@/modules/members/components/MemberRegistrationForm';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const CANTONS = [{ _id: 'c1', name: 'La Unión', province: 'Cartago' }];
const SECTORS = [{ _id: 's1', name: 'Comercio' }];

function renderForm(submit = vi.fn(async () => ({ id: 'm1' }))) {
  const navigate = vi.fn();

  render(
    <MemberRegistrationForm
      loadCantons={async () => CANTONS}
      loadSectors={async () => SECTORS}
      submit={submit}
      navigate={navigate}
    />,
  );

  // Ten fields of typing, and the delay between keystrokes is the whole cost:
  // with it the suite runs these past its own timeout under parallel load.
  return { submit, navigate, user: userEvent.setup({ delay: null }) };
}

async function fillEverything(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Nombre comercial'), 'Panadería Tres Ríos');
  await user.type(screen.getByLabelText('Cédula jurídica o física del comercio'), '3101456789');
  await user.type(screen.getByLabelText('Correo electrónico'), 'socio@example.cr');
  await user.type(screen.getByLabelText('Teléfono'), '88880000');
  await user.selectOptions(screen.getByLabelText('Cantón'), 'c1');
  await user.selectOptions(screen.getByLabelText('Sector'), 's1');
  await user.type(screen.getByLabelText('Ubicación'), 'Centro');
  await user.type(screen.getByLabelText(/Descripción breve/), 'Panadería artesanal.');
  await user.type(screen.getByLabelText('Contraseña'), 'Secreta.1');
  await user.type(screen.getByLabelText('Confirme la contraseña'), 'Secreta.1');
}

function send(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: 'Enviar registro' }));
}

describe('MemberRegistrationForm', () => {
  // Ten fields is genuinely more work than the suite's default allowance, and
  // under parallel load it goes past it. The work is real, so the allowance
  // moves rather than the test being trimmed into saying less.
  it('sends the application and moves to the screen that explains what follows', async () => {
    const { submit, navigate, user } = renderForm();

    await fillEverything(user);
    await send(user);

    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(REGISTRATION_SENT_PATH));
  }, 20000);

  // Somebody who was refused is still filling this in, and sending them
  // elsewhere would lose everything they typed.
  it('stays where it is when the chamber refuses the application', async () => {
    const { navigate, user } = renderForm(
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    await fillEverything(user);
    await send(user);

    await waitFor(() => expect(screen.getByLabelText('Nombre comercial')).toBeTruthy());
    expect(navigate).not.toHaveBeenCalled();
  }, 20000);

  it('goes nowhere while a field is still wrong', async () => {
    const { submit, navigate, user } = renderForm();

    await screen.findByLabelText('Nombre comercial');
    await send(user);

    await waitFor(() => expect(document.getElementById('email-error')).toBeTruthy());
    expect(submit).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
