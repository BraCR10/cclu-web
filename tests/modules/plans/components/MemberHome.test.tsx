import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberHome } from '@/modules/plans/components/MemberHome';
import type { Payment } from '@/modules/plans/api/payments';
import type { Plan } from '@/modules/plans/api/plans';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readOwnMembership = vi.fn();
const readPlans = vi.fn();
const readPaymentEligibility = vi.fn();
const readOwnPayments = vi.fn();

vi.mock('@/modules/plans/api/membership', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/membership')>()),
  readOwnMembership: () => readOwnMembership(),
}));

vi.mock('@/modules/plans/api/plans', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/plans')>()),
  readPlans: () => readPlans(),
}));

vi.mock('@/modules/plans/api/payments', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/payments')>()),
  readPaymentEligibility: () => readPaymentEligibility(),
  readOwnPayments: (status: string | null, page: number) => readOwnPayments(status, page),
  ownReceiptUrl: (paymentId: string) => `/api/members/me/payments/${paymentId}/receipt`,
}));

const FREE: Plan = {
  key: 'free',
  name: 'Gratuita',
  monthlyFee: 0,
  entitlements: {
    publishInMarketplace: false,
    publishJobs: false,
    banner: 'none',
    onlineWorkshops: false,
    massMailing: false,
  },
};

const PAID: Plan = {
  ...FREE,
  key: 'pro',
  name: 'Pro Pymex',
  monthlyFee: 12000,
  entitlements: { ...FREE.entitlements, publishInMarketplace: true, banner: 'unlimited' },
};

const ELIGIBILITY = {
  canSubmit: true,
  reason: null,
  opensOn: null,
  pendingPaymentId: null,
  reference: '0000-2026',
};

const REJECTED: Payment = {
  id: '65f0c3a1b2c3d4e5f6a7b8d1',
  plan: { key: 'pro', name: 'Pro Pymex' },
  monthlyFee: 12000,
  months: 3,
  frequency: 'quarterly',
  amount: 36000,
  reference: 'REF-778812',
  receipt: { contentType: 'image/png', size: 1024 },
  comment: null,
  resubmissionOf: null,
  status: 'rejected',
  submittedAt: '2026-10-02T15:00:00.000Z',
  decidedAt: '2026-10-04T15:00:00.000Z',
  decidedBy: 'Ana Solano',
  rejectionReason: 'El comprobante está ilegible.',
  term: null,
};

function pageOf(items: Payment[]) {
  return { items, page: 1, pageSize: 10, total: items.length, pageCount: 1 };
}

function renderHome() {
  return renderWithIntl(<MemberHome />);
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readPlans.mockResolvedValue([FREE, PAID]);
  readPaymentEligibility.mockResolvedValue(ELIGIBILITY);
  readOwnPayments.mockResolvedValue(pageOf([]));
});

describe('the member home', () => {
  // The free variant: no expiry to name, and publications are what a paid plan
  // buys, so it points at the plans instead of showing an empty grid.
  it('shows the free plan without an expiry and invites an upgrade', async () => {
    readOwnMembership.mockResolvedValue({
      memberCode: 'CLU001',
      plan: FREE,
      startedAt: '2026-01-10T15:00:00.000Z',
      expiresAt: null,
      validUntil: null,
      lapsed: null,
    });

    renderHome();

    expect(await screen.findByRole('heading', { name: 'Gratuita' })).toBeVisible();
    expect(screen.getByText('Activa')).toBeVisible();
    expect(screen.getByText('Sin vencimiento')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Mejorar mi plan' })).toHaveAttribute(
      'href',
      '/member/membership',
    );
    expect(screen.getByRole('link', { name: 'Ver los planes' })).toBeVisible();
    expect(screen.queryByText('Todavía no publicaste nada')).toBeNull();
  });

  it('shows the paid plan with the day its term ends', async () => {
    readOwnMembership.mockResolvedValue({
      memberCode: 'CLU001',
      plan: PAID,
      startedAt: '2026-09-01T15:00:00.000Z',
      expiresAt: '2026-12-01T06:00:00.000Z',
      validUntil: '2026-11-30',
      lapsed: null,
    });

    renderHome();

    expect(await screen.findByRole('heading', { name: 'Pro Pymex' })).toBeVisible();
    expect(screen.getByText(/Vigente hasta el/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Renovar' })).toBeVisible();
    // The publications area is a two-column grid, empty because publishing
    // does not exist yet.
    expect(screen.getByRole('list')).toHaveClass('grid-cols-2');
    expect(screen.getByText('Todavía no publicaste nada')).toBeVisible();
  });

  // A rejected payment is something to act on, so the home shows it as pending
  // and opens its detail without leaving the page.
  it('shows a rejected payment as pending and opens its detail', async () => {
    const user = userEvent.setup();

    readOwnMembership.mockResolvedValue({
      memberCode: 'CLU001',
      plan: FREE,
      startedAt: '2026-01-10T15:00:00.000Z',
      expiresAt: null,
      validUntil: null,
      lapsed: { plan: { key: 'pro', name: 'Pro Pymex' }, expiresAt: null, validUntil: null },
    });
    readOwnPayments.mockImplementation(async (status: string | null) =>
      status === 'rejected' ? pageOf([REJECTED]) : pageOf([]),
    );

    renderHome();

    expect(await screen.findByText('Tu pago del plan Pro Pymex no fue aprobado')).toBeVisible();
    expect(screen.getByText('Motivo: El comprobante está ilegible.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Ver el pago' }));

    expect(await screen.findByText('REF-778812')).toBeVisible();
  });

  it('offers to send the rejected payment again with the same plan', async () => {
    readOwnMembership.mockResolvedValue({
      memberCode: 'CLU001',
      plan: PAID,
      startedAt: '2026-09-01T15:00:00.000Z',
      expiresAt: '2026-12-01T06:00:00.000Z',
      validUntil: '2026-11-30',
      lapsed: null,
    });
    readOwnPayments.mockImplementation(async (status: string | null) =>
      status === 'rejected' ? pageOf([REJECTED]) : pageOf([]),
    );

    renderHome();

    expect(await screen.findByRole('link', { name: 'Enviar de nuevo' })).toHaveAttribute(
      'href',
      `/member/payments/new?plan=pro&resubmissionOf=${REJECTED.id}`,
    );
  });

  it('says there is nothing pending when every payment is settled', async () => {
    readOwnMembership.mockResolvedValue({
      memberCode: 'CLU001',
      plan: PAID,
      startedAt: '2026-09-01T15:00:00.000Z',
      expiresAt: '2026-12-01T06:00:00.000Z',
      validUntil: '2026-11-30',
      lapsed: null,
    });

    renderHome();

    expect(await screen.findByText('No tenés nada pendiente.')).toBeVisible();
  });

  it('says the home could not be loaded when the membership fails', async () => {
    readOwnMembership.mockRejectedValue(new Error('network'));

    renderHome();

    expect(
      await screen.findByText('No pudimos cargar tu inicio. Intentá de nuevo en unos minutos.'),
    ).toBeVisible();
  });
});
