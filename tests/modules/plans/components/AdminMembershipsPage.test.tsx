import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminMembershipsPage } from '@/modules/plans/components/AdminMembershipsPage';
import type {
  AdminMembership,
  AdminMembershipList,
  MembershipListView,
} from '@/modules/plans/api/adminMemberships';
import type { Plan } from '@/modules/plans/api/plans';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readAdminMemberships = vi.fn();
const readPlans = vi.fn();

vi.mock('@/modules/plans/api/adminMemberships', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/adminMemberships')>()),
  readAdminMemberships: (query: unknown) => readAdminMemberships(query),
}));

vi.mock('@/modules/plans/api/plans', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/plans')>()),
  readPlans: () => readPlans(),
}));

const entitlements: Plan['entitlements'] = {
  publishInMarketplace: true,
  publishJobs: true,
  banner: 'none',
  onlineWorkshops: false,
  massMailing: false,
};

const plans: Plan[] = [
  { key: 'free', name: 'Gratuita', monthlyFee: 0, entitlements },
  { key: 'lite', name: 'Lite MiPyme', monthlyFee: 9000, entitlements },
  { key: 'pro', name: 'Pro Pymex', monthlyFee: 18000, entitlements },
  { key: 'premium', name: 'Premium Empresarial', monthlyFee: 32000, entitlements },
];

const counts = { active: 92, expiring: 4, expired: 7 };

const active: AdminMembership = {
  memberId: 'm1',
  memberCode: 'CLU027',
  businessName: 'Veterinaria Patitas',
  plan: { key: 'lite', name: 'Lite MiPyme' },
  frequency: 'monthly',
  lastPaymentAt: '2026-08-30T06:00:00.000Z',
  expiresAt: '2026-09-30T06:00:00.000Z',
  validUntil: '2026-09-29',
};

// Back on Gratuita: the row names the plan that ran out and its last day.
const expired: AdminMembership = {
  memberId: 'm2',
  memberCode: 'CLU052',
  businessName: 'Soda La Pradera',
  plan: { key: 'pro', name: 'Pro Pymex' },
  frequency: 'annual',
  lastPaymentAt: '2025-10-01T06:00:00.000Z',
  expiresAt: '2026-10-01T06:00:00.000Z',
  validUntil: '2026-09-30',
};

function pageFor(items: AdminMembership[]): AdminMembershipList {
  return { items, page: 1, pageSize: 8, total: items.length, pageCount: 1, counts, noticeDays: 7 };
}

function renderPage() {
  viewportIsDesktop(true);

  return renderWithIntl(<AdminMembershipsPage />);
}

describe('AdminMembershipsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readPlans.mockResolvedValue(plans);
    readAdminMemberships.mockImplementation(async (query: { view: MembershipListView }) =>
      query.view === 'expired' ? pageFor([expired]) : pageFor([active]),
    );
  });

  it('opens on the active memberships and shows the three figures the list is split by', async () => {
    renderPage();

    const countsGroup = await screen.findByRole('button', { name: /Activas/ });

    expect(await screen.findByText('92')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(countsGroup.getAttribute('aria-pressed')).toBe('true');
    expect(readAdminMemberships).toHaveBeenCalledWith(
      expect.objectContaining({ view: 'active', plan: null }),
    );
  });

  it('listing the expired ones names the plan that ran out and the day it ended', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Vencidas/ }));

    expect((await screen.findAllByText('Soda La Pradera')).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(readAdminMemberships).toHaveBeenLastCalledWith(
        expect.objectContaining({ view: 'expired' }),
      ),
    );

    // The column says the date has passed rather than promising one to come.
    const table = screen.getByRole('table', { name: 'Membresías' });

    expect(within(table).getByRole('columnheader', { name: 'Venció' })).toBeTruthy();
    expect(within(table).queryByRole('columnheader', { name: 'Vence' })).toBeNull();
  });

  it('the plan filter reaches the expired ones too', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Vencidas/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Pro Pymex' }));

    await waitFor(() =>
      expect(readAdminMemberships).toHaveBeenLastCalledWith(
        expect.objectContaining({ view: 'expired', plan: 'pro' }),
      ),
    );
  });
});
