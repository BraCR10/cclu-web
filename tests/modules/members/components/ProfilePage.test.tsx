import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api/apiError';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { ProfilePage } from '@/modules/members/components/ProfilePage';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readProfile = vi.fn();
const saveProfile = vi.fn();
const requestEmailChange = vi.fn();
const requestPasswordLink = vi.fn();

vi.mock('@/modules/members/api/profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/profile')>()),
  readProfile: () => readProfile(),
  saveProfile: (changes: unknown) => saveProfile(changes),
  requestEmailChange: (email: string) => requestEmailChange(email),
  requestPasswordLink: (email: string) => requestPasswordLink(email),
}));

vi.mock('@/modules/members/api/registration', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/registration')>()),
  readCantons: async () => [
    { _id: '65f0c3a1b2c3d4e5f6a7b8c9', name: 'La Unión', province: 'Cartago' },
  ],
  readActivities: async () => [{ _id: '65f0c3a1b2c3d4e5f6a7b8ca', name: 'Cafeterías' }],
}));

const PROFILE = {
  _id: '65f0c3a1b2c3d4e5f6a7b8c9',
  state: 'active',
  memberType: 'business',
  identificationType: 'legal_entity_id',
  identificationNumber: '3-102-650901',
  memberCode: 'CLU001',
  name: null,
  legalName: 'Granja Orgánica San Ramón Limitada',
  legalRepresentativeName: 'José Pablo Ureña Mata',
  legalRepresentativeIdentification: '1-1234-0567',
  certificationFileKey: null,
  certificationIssuedAt: '2026-03-17',
  businessName: 'Granja Orgánica San Ramón',
  managerName: 'José Pablo Ureña Mata',
  businessDescription: 'Hortalizas de la zona.',
  logoFileKey: null,
  logoUrl: null,
  branchModality: 'physical',
  branchName: 'Finca San Ramón',
  canton: { _id: '65f0c3a1b2c3d4e5f6a7b8c9', name: 'La Unión', province: 'Cartago' },
  district: 'San Ramón',
  location: 'Frente a la plaza',
  institutionalPhone: '22791234',
  activity: { _id: '65f0c3a1b2c3d4e5f6a7b8ca', name: 'Cafeterías' },
  activityOther: null,
  email: 'info@granjaorganicasanramon.cr',
  phone: '8710 3345',
  whatsappNumber: '8710 3345',
  billingEmail: 'facturacion@granjaorganicasanramon.cr',
  instagram: '@granjaorganica',
  facebook: null,
  linkedin: null,
  website: null,
  passwordChangedAt: '2026-03-17T15:00:00.000Z',
  createdAt: '2026-03-01T15:00:00.000Z',
};

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readProfile.mockResolvedValue(PROFILE);
  saveProfile.mockResolvedValue(PROFILE);
  requestEmailChange.mockResolvedValue({ email: 'nuevo@example.cr', minutesValid: 30 });
  requestPasswordLink.mockResolvedValue({ minutesValid: 30 });
});

describe('the profile screen', () => {
  it('shows the business, how to reach it and the account it belongs to', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' })).toBeVisible();
    expect(screen.getByText(/Empresa/)).toBeVisible();
    expect(screen.getByText('CLU001')).toBeVisible();
    expect(screen.getByText('info@granjaorganicasanramon.cr')).toBeVisible();
    expect(screen.getByText('3-102-650901')).toBeVisible();
  });

  // Each section is edited in its own popup, and the body carries that section
  // only: a popup that never showed the address cannot overwrite it.
  it('edits the business in its popup and says it saved', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' });
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[0]);

    const businessName = await screen.findByLabelText('Nombre comercial');

    await user.clear(businessName);
    await user.type(businessName, 'Granja San Ramón');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(saveProfile).toHaveBeenCalled());

    const [changes] = saveProfile.mock.calls[0];

    expect((changes as Record<string, string>).businessName).toBe('Granja San Ramón');
    expect('email' in (changes as object)).toBe(false);
    expect('phone' in (changes as object)).toBe(false);
    expect(await screen.findByText('Guardamos los cambios.')).toBeVisible();
  });

  // A refusal that names a field belongs under the field, not in a sentence at
  // the top of the popup.
  it('shows what the API refused under the field it names', async () => {
    const user = userEvent.setup();

    saveProfile.mockRejectedValueOnce(
      new ApiError({
        status: 400,
        code: 'invalid_format',
        message: 'not a link',
        field: 'website',
      }),
    );
    renderPage();

    await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' });
    // The banner, the business, the contact and the legal card each have one; the
    // contact section is the third.
    await user.click(screen.getAllByRole('button', { name: 'Editar' })[2]);
    await user.type(await screen.findByLabelText('Sitio web'), 'no-es-un-enlace');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('El formato no es válido.')).toBeVisible();
  });

  it('asks for the address change instead of applying it', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));

    await user.type(await screen.findByLabelText('Correo nuevo'), 'nuevo@example.cr');
    await user.type(screen.getByLabelText('Repetí el correo nuevo'), 'nuevo@example.cr');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() => expect(requestEmailChange).toHaveBeenCalledWith('nuevo@example.cr'));
    expect(await screen.findByText(/Te enviamos un enlace al correo nuevo/)).toBeVisible();
  });

  it('refuses an address written twice differently before anything is sent', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' });
    await user.click(screen.getByRole('button', { name: 'Cambiar' }));

    await user.type(await screen.findByLabelText('Correo nuevo'), 'nuevo@example.cr');
    await user.type(screen.getByLabelText('Repetí el correo nuevo'), 'otro@example.cr');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText('Los dos correos no coinciden.')).toBeVisible();
    expect(requestEmailChange).not.toHaveBeenCalled();
  });

  // A password is changed by its own link, and the screen says the link went out.
  it('sends the password link to the address of the account', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByRole('heading', { name: 'Granja Orgánica San Ramón' });
    await user.click(screen.getByRole('button', { name: 'Enviarme el enlace' }));

    await waitFor(() =>
      expect(requestPasswordLink).toHaveBeenCalledWith('info@granjaorganicasanramon.cr'),
    );
    expect(await screen.findByText(/Te enviamos un enlace al correo de tu cuenta/)).toBeVisible();
  });
});
