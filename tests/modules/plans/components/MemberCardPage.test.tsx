import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { MemberCardPage } from '@/modules/plans/components/MemberCardPage';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readOwnMembership = vi.fn();
const readPlans = vi.fn();
const readPaymentEligibility = vi.fn();

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
}));

// The QR's own rendering is the library's business; what matters here is what it
// is told to encode, so the stand-in carries the value it was given.
vi.mock('react-qr-code', () => ({
  default: ({ value }: { value: string }) => <svg data-testid="qr" data-value={value} />,
}));

const FREE = {
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

const PRO = {
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

function freeMembership() {
  return {
    memberCode: 'CLU001',
    businessName: 'Café Loma Verde',
    plan: FREE,
    startedAt: '2026-01-10T15:00:00.000Z',
    expiresAt: null,
    validUntil: null,
    lapsed: null,
  };
}

function paidMembership() {
  return {
    memberCode: 'CLU001',
    businessName: 'Café Loma Verde',
    plan: PRO,
    startedAt: '2026-09-01T15:00:00.000Z',
    expiresAt: '2026-12-01T06:00:00.000Z',
    validUntil: '2026-11-30',
    lapsed: null,
  };
}

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <MemberCardPage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readPlans.mockResolvedValue([FREE, PRO]);
  readPaymentEligibility.mockResolvedValue(ELIGIBILITY);
  readOwnMembership.mockResolvedValue(freeMembership());
});

describe('the member card', () => {
  it('shows the business, the CLU code, the plan and its term', async () => {
    renderPage();

    const card = within(await screen.findByRole('article'));

    expect(card.getByText('Café Loma Verde')).toBeVisible();
    expect(card.getByText('CLU001')).toBeVisible();
    expect(card.getByText('Cámara de Comercio de La Unión')).toBeVisible();
    expect(card.getByText('Gratuita')).toBeVisible();
    // Free plan: there is no day it ends on, and the card says so.
    expect(card.getByText('Sin vencimiento')).toBeVisible();
    expect(card.getByText('Activa')).toBeVisible();
  });

  it('encodes the public profile in the QR, on the address it is served from', async () => {
    renderPage();

    expect(await screen.findByTestId('qr')).toHaveAttribute(
      'data-value',
      'http://localhost:3000/directory/CLU001',
    );
  });

  // The free card is the one thing a paid plan visibly buys, so the notice says
  // what changes rather than hiding the option.
  it('tells a free member what a paid plan changes about the card', async () => {
    renderPage();

    expect(await screen.findByText('Tu carné es del plan Gratuita')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver planes' })).toHaveAttribute('href', '/plans');
  });

  it('shows a paid plan with the day its term ends and no upgrade notice', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    const card = within(await screen.findByRole('article'));

    expect(card.getByText('Pro Pymex')).toBeVisible();
    expect(card.getByText(/Vigente hasta el/)).toBeVisible();
    expect(screen.queryByText('Tu carné es del plan Gratuita')).toBeNull();
  });

  it('copies the link to the public profile', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Copiar enlace de la ficha' }));

    expect(await window.navigator.clipboard.readText()).toBe(
      'http://localhost:3000/directory/CLU001',
    );
    expect(await screen.findByText('Copiamos el enlace de tu ficha.')).toBeVisible();
  });

  it('sends the card to the printer when it is downloaded', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Descargar' }));

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });

  it('says the card could not be loaded when the membership fails', async () => {
    readOwnMembership.mockRejectedValue(new Error('network'));

    renderPage();

    expect(
      await screen.findByText('No pudimos cargar tu carné. Intentá de nuevo en unos minutos.'),
    ).toBeVisible();
  });
});
