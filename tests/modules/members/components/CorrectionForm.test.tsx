import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/shared/api/apiError';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { CorrectionForm } from '@/modules/members/components/CorrectionForm';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const TOKEN = 'a'.repeat(64);
const router = { push: vi.fn() };

vi.mock('next/navigation', () => ({ useRouter: () => router }));

const readCorrection = vi.fn();
const submitCorrection = vi.fn();

vi.mock('@/modules/members/api/correction', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/correction')>()),
  readCorrection: (token: string) => readCorrection(token),
  submitCorrection: (token: string, draft: unknown) => submitCorrection(token, draft),
}));

vi.mock('@/modules/members/api/registration', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/registration')>()),
  readCantons: async () => [
    { _id: '65f0c3a1b2c3d4e5f6a7b8c9', name: 'La Unión', province: 'Cartago' },
  ],
  readActivities: async () => [{ _id: '65f0c3a1b2c3d4e5f6a7b8ca', name: 'Cafeterías' }],
}));

// What the link opens: the whole application, prefilled, with the chamber's
// reason, what it said about the field it named, and who decided.
const OPENED = {
  memberType: 'business',
  identificationType: 'legal_entity_id',
  identificationNumber: '3-102-650901',
  legalName: 'Granja Orgánica San Ramón Limitada',
  name: null,
  businessName: 'Granja Orgánica San Ramón',
  managerName: 'José Pablo Ureña Mata',
  activity: '65f0c3a1b2c3d4e5f6a7b8ca',
  activityOther: null,
  canton: '65f0c3a1b2c3d4e5f6a7b8c9',
  district: 'San Ramón',
  phone: '8710 3345',
  whatsappNumber: '8710 3345',
  email: 'info@granjaorganicasanramon.cr',
  reason: 'La cédula jurídica no coincide con el nombre comercial.',
  fields: [
    {
      field: 'identificationNumber',
      message: 'no coincide con la razón social registrada.',
    },
  ],
  applicationStatus: 'changes_requested',
  reviewedAt: '2026-09-29T15:00:00.000Z',
  reviewedBy: 'Laura Jiménez Castro',
};

// The screen shows its refusals through the same toast layer the rest of the
// application uses, so it is rendered inside it.
function renderScreen() {
  return renderWithIntl(
    <ToastProvider>
      <CorrectionForm token={TOKEN} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readCorrection.mockResolvedValue(OPENED);
  submitCorrection.mockResolvedValue({ id: '1', applicationStatus: 'pending_review' });
});

describe('the correction screen', () => {
  it('opens on what the chamber said, and on the whole application', async () => {
    renderScreen();

    expect(
      await screen.findByText(/La cédula jurídica no coincide con el nombre comercial\./),
    ).toBeVisible();
    expect(screen.getByText('La Cámara pidió cambios')).toBeVisible();
    expect(screen.getByLabelText('Nombre comercial')).toHaveValue('Granja Orgánica San Ramón');
    expect(screen.getByLabelText('Razón social')).toHaveValue('Granja Orgánica San Ramón Limitada');
    expect(screen.getByLabelText('Distrito')).toHaveValue('San Ramón');
  });

  // The reason for the field is on the field, which is what the applicant fixes
  // it by.
  it('shows what is wrong with the field the chamber named', async () => {
    renderScreen();

    expect(await screen.findByText('no coincide con la razón social registrada.')).toBeVisible();
  });

  it('says who decided and when', async () => {
    renderScreen();

    expect(await screen.findByText('Cambios solicitados')).toBeVisible();
    expect(screen.getByText(/Revisada el .* por Laura Jiménez Castro/)).toBeVisible();
  });

  // The address is the identity of the account, and this link cannot change it.
  it('shows the address without letting it be edited', async () => {
    renderScreen();

    const email = await screen.findByLabelText('Correo electrónico');

    expect(email).toHaveValue('info@granjaorganicasanramon.cr');
    expect(email).toHaveAttribute('readonly');
  });

  // A correction neither sets a password nor asks for consent again, and the
  // fields the screen does not show are preserved rather than corrected.
  it('does not ask for a password, for consent or for the branch', async () => {
    renderScreen();

    await screen.findByLabelText('Distrito');

    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
    expect(screen.queryByText('Acepto los estatutos')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Descripción del negocio')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre de la sucursal')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Correo de facturación')).not.toBeInTheDocument();
  });

  it('sends the correction and says the application is under review again', async () => {
    const user = userEvent.setup();

    renderScreen();

    await user.clear(await screen.findByLabelText('Distrito'));
    await user.type(screen.getByLabelText('Distrito'), 'San Rafael');
    await user.click(screen.getByRole('button', { name: 'Reenviar solicitud' }));

    await waitFor(() => expect(submitCorrection).toHaveBeenCalled());

    const [token, draft] = submitCorrection.mock.calls[0];

    expect(token).toBe(TOKEN);
    expect((draft as { district: string }).district).toBe('San Rafael');
    expect(await screen.findByText('Recibimos tus correcciones')).toBeVisible();
  });

  // A correction that lost a required field is refused before anything is sent,
  // and says which field it is.
  it('refuses a correction that lost a required field', async () => {
    const user = userEvent.setup();

    renderScreen();

    await user.clear(await screen.findByLabelText('Nombre comercial'));
    await user.click(screen.getByRole('button', { name: 'Reenviar solicitud' }));

    expect(await screen.findByText('Este campo es obligatorio.')).toBeVisible();
    expect(submitCorrection).not.toHaveBeenCalled();
  });

  it('asks a person for their own name when they say that is what they are', async () => {
    const user = userEvent.setup();

    renderScreen();

    await user.click(await screen.findByRole('radio', { name: /Profesional independiente/ }));

    expect(screen.getByLabelText('Nombre completo')).toBeVisible();
    expect(screen.queryByLabelText('Razón social')).not.toBeInTheDocument();
  });

  // A link that was spent, expired or never existed leaves nothing to correct.
  it('says so when the link no longer opens anything', async () => {
    readCorrection.mockRejectedValue(
      new ApiError({ status: 404, code: 'invalid_code', message: 'The link is not valid.' }),
    );

    renderScreen();

    expect(await screen.findByText('Este enlace ya no sirve')).toBeVisible();
    expect(screen.getByText('El enlace no es válido o ya venció.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Reenviar solicitud' })).not.toBeInTheDocument();
  });
});
