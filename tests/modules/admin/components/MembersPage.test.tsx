import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { MembersPage } from '@/modules/admin/components/MembersPage';
import { MemberDetailPage } from '@/modules/admin/components/MemberDetailPage';
import type { MemberDetail, MemberRow } from '@/modules/admin/api/members';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readMembers = vi.fn();
const exportMembers = vi.fn();
const readMember = vi.fn();
const updateMember = vi.fn();
const setMemberStatus = vi.fn();
const saveFile = vi.fn();

vi.mock('@/modules/admin/api/members', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/members')>()),
  readMembers: (filters: unknown, query: unknown) => readMembers(filters, query),
  exportMembers: (filters: unknown, search: string) => exportMembers(filters, search),
  readMember: (id: string) => readMember(id),
  updateMember: (id: string, changes: unknown) => updateMember(id, changes),
  setMemberStatus: (id: string, status: string, reason: string) =>
    setMemberStatus(id, status, reason),
}));

vi.mock('@/shared/utils/saveFile', () => ({
  saveFile: (file: unknown, name: string) => saveFile(file, name),
}));

const ana: MemberRow = {
  id: 'm1',
  businessName: 'Café La Unión',
  name: null,
  email: 'ana@cafelaunion.cr',
  phone: '8888 8888',
  memberType: 'business',
  memberCode: 'M7K2QX4',
  accountStatus: 'active',
  canton: 'La Unión',
  district: 'Tres Ríos',
  joinedAt: '2026-01-15T10:00:00.000Z',
  plan: { key: 'pro', name: 'Pro', expiresAt: '2026-12-31T06:00:00.000Z' },
};

const detail: MemberDetail = {
  ...ana,
  identificationType: 'legal_entity_id',
  identificationNumber: '3-101-123456',
  legalName: 'Café La Unión S.A.',
  legalRepresentativeName: null,
  businessDescription: null,
  activity: 'Cafeterías',
  location: '100 m norte del parque',
  whatsappNumber: '8888 8888',
  billingEmail: 'facturas@cafelaunion.cr',
  institutionalPhone: null,
  website: null,
  instagram: null,
  facebook: null,
  linkedin: null,
  membership: {
    status: 'active',
    startedAt: '2026-01-15T10:00:00.000Z',
    expiresAt: '2026-12-31T06:00:00.000Z',
    frequency: 'annual',
  },
  payments: [
    {
      id: 'p1',
      planName: 'Pro',
      amount: 25000,
      status: 'approved',
      submittedAt: '2026-02-01T10:00:00.000Z',
      decidedAt: '2026-02-02T10:00:00.000Z',
    },
  ],
  publications: [
    {
      id: 'pub1',
      title: 'Café de altura',
      type: 'product',
      status: 'active',
      publishedAt: '2026-03-01T10:00:00.000Z',
    },
  ],
};

function renderList() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <MembersPage />
    </ToastProvider>,
  );
}

function renderDetail() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <MemberDetailPage memberId={ana.id} />
    </ToastProvider>,
  );
}

describe('MembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readMembers.mockResolvedValue({ items: [ana], page: 1, pageSize: 10, total: 1, pageCount: 1 });
  });

  it('lists each member with the plan they hold and their state', async () => {
    renderList();

    expect((await screen.findAllByText('Café La Unión')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('M7K2QX4 · ana@cafelaunion.cr').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
  });

  it('exports what the filters match, not just the page', async () => {
    const person = userEvent.setup();
    exportMembers.mockResolvedValue(new Blob(['csv']));

    renderList();

    await screen.findAllByText('Café La Unión');
    await person.click(screen.getByRole('button', { name: 'Exportar' }));

    await waitFor(() => expect(exportMembers).toHaveBeenCalled());
    expect(saveFile).toHaveBeenCalledWith(expect.anything(), 'agremiados.csv');
  });
});

describe('MemberDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readMember.mockResolvedValue(detail);
  });

  it('opens the record with its data and its plan', async () => {
    renderDetail();

    expect(await screen.findByText(/3-101-123456/)).toBeInTheDocument();
    expect(screen.getByText('Cafeterías')).toBeInTheDocument();
    expect(screen.getAllByText(/M7K2QX4/).length).toBeGreaterThan(0);
  });

  it('suspending asks for a reason before anything is sent', async () => {
    const person = userEvent.setup();
    setMemberStatus.mockResolvedValue({ ...detail, accountStatus: 'suspended' });

    renderDetail();

    await screen.findByText(/3-101-123456/);
    await person.click(screen.getByRole('button', { name: 'Suspender cuenta' }));

    const dialog = await screen.findByRole('dialog');
    await person.type(
      within(dialog).getByLabelText('Motivo'),
      'Dejó de pagar dos cuotas seguidas.',
    );
    await person.click(within(dialog).getByRole('button', { name: 'Suspender cuenta' }));

    await waitFor(() =>
      expect(setMemberStatus).toHaveBeenCalledWith(
        ana.id,
        'suspended',
        'Dejó de pagar dos cuotas seguidas.',
      ),
    );
    expect(await screen.findByText('Cuenta suspendida')).toBeInTheDocument();
  });

  it('correcting the contact details sends only those fields', async () => {
    const person = userEvent.setup();
    updateMember.mockResolvedValue(detail);

    renderDetail();

    await screen.findByText(/3-101-123456/);
    await person.click(screen.getByRole('button', { name: 'Editar contacto' }));

    const dialog = await screen.findByRole('dialog');
    const phone = within(dialog).getByLabelText('Teléfono');
    await person.clear(phone);
    await person.type(phone, '7777 7777');
    await person.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(updateMember).toHaveBeenCalledWith(ana.id, {
        phone: '7777 7777',
        whatsappNumber: '8888 8888',
        billingEmail: 'facturas@cafelaunion.cr',
      }),
    );
  });
});
