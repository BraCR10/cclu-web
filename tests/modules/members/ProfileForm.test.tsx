import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '@/modules/members/components/ProfileForm';
import { MESSAGES, messageForFieldCode } from '@/shared/config/messages';
import type { MemberProfile } from '@/modules/members/api/profile';

const CANTONS = [
  { _id: 'c1', name: 'La Unión', province: 'Cartago' },
  { _id: 'c2', name: 'Curridabat', province: 'San José' },
];
const SECTORS = [
  { _id: 's1', name: 'Comercio' },
  { _id: 's2', name: 'Tecnología' },
];

function profile(overrides: Partial<MemberProfile> = {}): MemberProfile {
  return {
    _id: 'm1',
    email: 'socio@example.cr',
    phone: '88880000',
    location: 'Centro',
    businessName: 'Panadería Tres Ríos',
    businessDescription: 'Panadería artesanal.',
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3101456789',
    memberCode: 'MA7K2Q4',
    createdAt: '2026-03-04T12:00:00.000Z',
    state: 'active',
    canton: CANTONS[0],
    sector: SECTORS[0],
    ...overrides,
  };
}

function renderForm(overrides: Parameters<typeof ProfileForm>[0] = {}) {
  const saveProfile = overrides.saveProfile ?? vi.fn(async () => profile());

  render(
    <ProfileForm
      loadProfile={overrides.loadProfile ?? (async () => profile())}
      loadCantons={overrides.loadCantons ?? (async () => CANTONS)}
      loadSectors={overrides.loadSectors ?? (async () => SECTORS)}
      saveProfile={saveProfile}
    />,
  );

  return { saveProfile, user: userEvent.setup() };
}

async function save(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
}

describe('ProfileForm', () => {
  it('shows what the chamber decides as read only, never as a field', async () => {
    renderForm();

    expect(await screen.findByText('socio@example.cr')).toBeTruthy();
    expect(screen.getByText('3101456789')).toBeTruthy();
    expect(screen.getByText('M-A7K2-Q4')).toBeTruthy();
    expect(screen.queryByLabelText('Correo electrónico')).toBeNull();
    expect(screen.queryByLabelText('Código de agremiado')).toBeNull();
  });

  it('shows the state in one phrase rather than two fields', async () => {
    renderForm({ loadProfile: async () => profile({ state: 'suspended' }) });

    expect(await screen.findByText('Afiliación suspendida')).toBeTruthy();
  });

  // A field nobody opened is not an instruction to write the same value back.
  it('sends only the fields that actually changed', async () => {
    const { saveProfile, user } = renderForm();

    const name = await screen.findByLabelText('Nombre comercial');
    await user.clear(name);
    await user.type(name, 'Panadería Renombrada');
    await save(user);

    await waitFor(() => expect(saveProfile).toHaveBeenCalledOnce());
    expect(saveProfile).toHaveBeenCalledWith({ businessName: 'Panadería Renombrada' });
  });

  it('says so instead of asking the server when nothing changed', async () => {
    const { saveProfile, user } = renderForm();

    await screen.findByLabelText('Nombre comercial');
    await save(user);

    expect(await screen.findByText(MESSAGES.nothing_to_change)).toBeTruthy();
    expect(saveProfile).not.toHaveBeenCalled();
  });

  // A form that only refuses leaves the person hunting for what it disliked.
  it('names the field it is refusing rather than only refusing', async () => {
    const { saveProfile, user } = renderForm();

    const name = await screen.findByLabelText('Nombre comercial');
    await user.clear(name);
    await save(user);

    expect(await screen.findByText(MESSAGES.required)).toBeTruthy();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(saveProfile).not.toHaveBeenCalled();
  });

  // The refusal states the rule that was broken. "Check the format" sends the
  // person back to the field knowing exactly as much as before.
  it('refuses a web address that is not one and says what one looks like', async () => {
    const { saveProfile, user } = renderForm();

    const website = await screen.findByLabelText('Sitio web');
    await user.type(website, 'panaderia.cr');
    await save(user);

    // Scoped to the paragraph, because the same rules are also carried in a
    // hidden copy the control points at, so a screen reader reaches them
    // without opening anything.
    const shown = await screen.findByText(messageForFieldCode('website', 'invalid_format'), {
      selector: 'p',
    });

    expect(shown).toBeTruthy();
    expect(saveProfile).not.toHaveBeenCalled();
  });

  it('confirms a save that went through', async () => {
    const { user } = renderForm();

    const phone = await screen.findByLabelText('Teléfono');
    await user.clear(phone);
    await user.type(phone, '22223333');
    await save(user);

    expect(await screen.findByText('Su perfil quedó actualizado')).toBeTruthy();
  });

  it('reports a refusal without pretending the change was kept', async () => {
    const saveProfile = vi.fn(async (): Promise<MemberProfile> => {
      throw new Error('network');
    });
    const { user } = renderForm({ saveProfile });

    const phone = await screen.findByLabelText('Teléfono');
    await user.clear(phone);
    await user.type(phone, '22223333');
    await save(user);

    expect(await screen.findByText('No se pudo guardar')).toBeTruthy();
  });

  it('offers the catalogs as closed lists rather than free text', async () => {
    renderForm();

    const canton = (await screen.findByLabelText('Cantón')) as HTMLSelectElement;
    const sector = screen.getByLabelText('Sector') as HTMLSelectElement;

    expect(canton.tagName).toBe('SELECT');
    expect(sector.tagName).toBe('SELECT');
    expect(canton.value).toBe('c1');
    expect(sector.value).toBe('s1');
  });

  it('reports a profile it could not read instead of showing an empty form', async () => {
    renderForm({
      loadProfile: async () => {
        throw new Error('network');
      },
    });

    expect((await screen.findByRole('alert')).textContent).toContain('No fue posible cargar');
  });

  it('sends a changed reference by its identifier', async () => {
    const { saveProfile, user } = renderForm();

    await user.selectOptions(await screen.findByLabelText('Sector'), 's2');
    await save(user);

    await waitFor(() => expect(saveProfile).toHaveBeenCalledWith({ sector: 's2' }));
  });
});
