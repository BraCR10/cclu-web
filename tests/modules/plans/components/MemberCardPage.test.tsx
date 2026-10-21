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
    expect(screen.getByRole('link', { name: 'Mejorar mi plan' })).toHaveAttribute(
      'href',
      '/member/membership#change-plan',
    );
  });

  it('shows a paid plan with the day its term ends and no upgrade notice', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    const card = within(await screen.findByRole('article'));

    expect(card.getByText('Pro Pymex')).toBeVisible();
    expect(card.getByText(/Vigente hasta el/)).toBeVisible();
    expect(screen.queryByText('Tu carné es del plan Gratuita')).toBeNull();
  });

  // The prototype draws one card per plan: its colour, its two hills and, on
  // Premium alone, the sun.
  it('draws the hills of the member plan on the card', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    const card = await screen.findByRole('article');
    const artwork = Array.from(card.querySelectorAll('img')).map((image) =>
      image.getAttribute('src'),
    );

    expect(artwork).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/brand/card/pro-back-hill.svg'),
        expect.stringContaining('/brand/card/pro-hill.svg'),
      ]),
    );
    expect(artwork.some((source) => source?.includes('premium-sun'))).toBe(false);
  });

  it('puts the sun on the Premium card', async () => {
    readOwnMembership.mockResolvedValue({
      ...paidMembership(),
      plan: { ...PRO, key: 'premium', name: 'Premium Empresarial' },
    });

    renderPage();

    const card = await screen.findByRole('article');
    const artwork = Array.from(card.querySelectorAll('img')).map((image) =>
      image.getAttribute('src'),
    );

    expect(artwork).toEqual(
      expect.arrayContaining([expect.stringContaining('/brand/card/premium-sun.svg')]),
    );
  });

  // At the counter the card is shown, not read: it opens on its own, as large as
  // the screen allows, so the QR scans at arm's length.
  it('shows the card on its own, large, to hold up at the counter', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Mostrar carné' }));

    const shown = await screen.findByRole('dialog', { name: 'Tu carné' });
    expect(shown).toHaveAttribute('data-presentation', 'fullscreen');
    expect(within(shown).getByText('Café Loma Verde')).toBeVisible();
    expect(within(shown).getByText('CLU001')).toBeVisible();
    expect(within(shown).getByTestId('qr')).toHaveAttribute(
      'data-value',
      'http://localhost:3000/directory/CLU001',
    );

    await user.click(within(shown).getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // A telephone shares through its own sheet; a browser without one copies the
  // link instead, so the button always does something.
  it('shares the public profile through the share sheet when there is one', async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'share', { value: share, configurable: true });

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Compartir' }));

    expect(share).toHaveBeenCalledWith({
      title: 'Café Loma Verde',
      url: 'http://localhost:3000/directory/CLU001',
    });

    Reflect.deleteProperty(window.navigator, 'share');
  });

  it('copies the link to the public profile when there is no share sheet', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Compartir' }));

    expect(await window.navigator.clipboard.readText()).toBe(
      'http://localhost:3000/directory/CLU001',
    );
    expect(await screen.findByText('Copiamos el enlace de tu ficha.')).toBeVisible();
  });

  it('sends the card to the printer', async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});

    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Imprimir' }));

    expect(print).toHaveBeenCalledOnce();
    print.mockRestore();
  });

  // The member checks what a customer sees without leaving their card behind.
  it('opens the public profile in a new tab from a button beside the others', async () => {
    renderPage();

    const link = await screen.findByRole('link', { name: /Ver mi ficha/ });

    expect(link).toHaveAttribute('href', '/directory/CLU001');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName('Ver mi ficha (se abre en una pestaña nueva)');
  });

  // The card already says who, which code and until when. Beside it goes what
  // the member can do about their plan, never the same data a second time.
  it('does not repeat the card data beside it', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    await screen.findByRole('article');
    expect(screen.queryByRole('heading', { name: 'Datos del carné' })).toBeNull();
    expect(screen.queryByText(/http:\/\/localhost:3000\/directory/)).toBeNull();
  });

  // Beside the card goes what the card cannot say: what the plan lets the member
  // do and how long it has left, never the plan or the date a second time.
  it('lists what the plan includes and how many days it has left', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    const included = await screen.findByRole('list', { name: 'Lo que incluye tu plan' });
    expect(
      within(included).getByText('Publicar productos, promociones y descuentos'),
    ).toBeVisible();
    expect(within(included).queryByText('Carné digital con QR')).toBeNull();
    expect(screen.getByText(/Te quedan? \d+ días?/)).toBeVisible();
    expect(screen.getAllByText('Pro Pymex')).toHaveLength(1);
  });

  it('shows no countdown for Gratuita, which does not expire', async () => {
    renderPage();

    await screen.findByRole('list', { name: 'Lo que incluye tu plan' });
    expect(screen.queryByText(/Te quedan? \d+ días?/)).toBeNull();
  });

  it('offers to renew a paid plan once the renewal is open', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());

    renderPage();

    expect(await screen.findByRole('link', { name: 'Renovar' })).toHaveAttribute(
      'href',
      '/member/payments/new?plan=pro',
    );
  });

  it('says when a paid plan can be renewed while the renewal is not open yet', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());
    readPaymentEligibility.mockResolvedValue({
      ...ELIGIBILITY,
      canSubmit: false,
      reason: 'renewal_not_open',
      opensOn: '2026-11-23',
    });

    renderPage();

    expect(await screen.findByText(/Podés renovar desde el/)).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Renovar' })).toBeNull();
  });

  it('says a payment is being reviewed instead of offering another', async () => {
    readOwnMembership.mockResolvedValue(paidMembership());
    readPaymentEligibility.mockResolvedValue({
      ...ELIGIBILITY,
      canSubmit: false,
      reason: 'payment_pending',
      pendingPaymentId: 'payment-1',
    });

    renderPage();

    expect(await screen.findByText('Estamos revisando tu pago.')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Renovar' })).toBeNull();
  });

  it('offers to renew the plan that lapsed', async () => {
    readOwnMembership.mockResolvedValue({
      ...freeMembership(),
      lapsed: {
        plan: { key: 'pro', name: 'Pro Pymex' },
        expiresAt: '2026-09-01T06:00:00.000Z',
        validUntil: '2026-08-31',
      },
    });

    renderPage();

    expect(await screen.findByRole('link', { name: 'Renovar Pro Pymex' })).toHaveAttribute(
      'href',
      '/member/payments/new?plan=pro',
    );
  });

  it('says the card could not be loaded when the membership fails', async () => {
    readOwnMembership.mockRejectedValue(new Error('network'));

    renderPage();

    expect(
      await screen.findByText('No pudimos cargar tu carné. Intentá de nuevo en unos minutos.'),
    ).toBeVisible();
  });
});
