import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResubmissionForm } from '@/modules/members/components/ResubmissionForm';
import type { RejectedRegistration } from '@/modules/members/api/resubmission';

function registration(overrides: Partial<RejectedRegistration> = {}): RejectedRegistration {
  return {
    email: 'socio@example.cr',
    businessName: 'Ferretería El Yugo',
    businessDescription: 'Materiales de construcción.',
    phone: '22791234',
    location: 'Calle vieja',
    whatsappNumber: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    website: null,
    logoUrl: null,
    reason: 'La cédula jurídica no coincide con el nombre comercial.',
    ...overrides,
  };
}

function renderForm(overrides: Partial<Parameters<typeof ResubmissionForm>[0]> = {}) {
  const resubmit = overrides.resubmit ?? vi.fn(async () => ({ applicationStatus: 'pending_review' }));

  render(
    <ResubmissionForm
      token={'a'.repeat(64)}
      loadRegistration={overrides.loadRegistration ?? (async () => registration())}
      resubmit={resubmit}
    />,
  );

  return { resubmit, user: userEvent.setup() };
}

describe('ResubmissionForm', () => {
  it('shows the reason the chamber gave, which is why the person is here', async () => {
    renderForm();

    expect(
      await screen.findByText('La cédula jurídica no coincide con el nombre comercial.'),
    ).toBeTruthy();
  });

  // The address is what ties the resubmission to the original application, so
  // it is shown and never offered as a field.
  it('shows the address without offering to change it', async () => {
    renderForm();

    expect(await screen.findByText(/socio@example.cr/)).toBeTruthy();
    expect(screen.queryByLabelText('Correo electrónico')).toBeNull();
  });

  it('sends the corrections and confirms the application is back under review', async () => {
    const { resubmit, user } = renderForm();

    const name = await screen.findByLabelText('Nombre comercial');
    await user.clear(name);
    await user.type(name, 'Ferretería Corregida');
    await user.click(screen.getByRole('button', { name: 'Enviar de nuevo' }));

    await waitFor(() => expect(resubmit).toHaveBeenCalledOnce());
    expect(resubmit.mock.calls[0][1].businessName).toBe('Ferretería Corregida');
    expect(await screen.findByText('Su solicitud quedó enviada de nuevo')).toBeTruthy();
  });

  it('checks a required field here before spending the link', async () => {
    const { resubmit, user } = renderForm();

    const phone = await screen.findByLabelText('Teléfono');
    await user.clear(phone);
    await user.click(screen.getByRole('button', { name: 'Enviar de nuevo' }));

    expect(await screen.findByText('Este dato es obligatorio.')).toBeTruthy();
    expect(resubmit).not.toHaveBeenCalled();
  });

  it('says plainly that a spent or expired link no longer opens', async () => {
    renderForm({
      loadRegistration: async () => {
        throw new Error('404');
      },
    });

    expect(await screen.findByText('Este enlace ya no sirve')).toBeTruthy();
  });

  it('reports a refusal instead of pretending the application went through', async () => {
    const { user } = renderForm({
      resubmit: vi.fn(async () => {
        throw new Error('network');
      }),
    });

    await screen.findByLabelText('Nombre comercial');
    await user.click(screen.getByRole('button', { name: 'Enviar de nuevo' }));

    expect((await screen.findByRole('alert')).textContent).toContain('No fue posible enviar');
    expect(screen.queryByText('Su solicitud quedó enviada de nuevo')).toBeNull();
  });
});
