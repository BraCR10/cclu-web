import { beforeEach, describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Home from '@/app/(public)/page';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

const readHome = vi.fn();
const readPlans = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock('@/modules/home/api/home', () => ({ readHome: () => readHome() }));

vi.mock('@/modules/plans/api/plans', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/plans/api/plans')>()),
  readPlans: () => readPlans(),
}));

vi.mock('react-qr-code', () => ({ default: () => <svg data-testid="qr" /> }));

const FEATURED = {
  memberCode: 'CLU001',
  businessName: 'Café Loma Verde',
  activity: 'Cafetería',
  logoFileKey: null,
  plan: { key: 'premium', name: 'Premium Empresarial' },
  branch: { name: 'Sucursal San Juan', district: 'San Juan' },
  otherBranches: 0,
  online: false,
};

// The sections arrive after the first render; each test waits for them, so no
// update lands after the viewport stub is removed.
async function renderHome() {
  renderWithIntl(
    <ToastProvider>
      <Home />
    </ToastProvider>,
  );

  await screen.findByRole('heading', { name: 'Comercios destacados' });
}

describe('Home', () => {
  beforeEach(() => {
    viewportIsDesktop(true);
    readPlans.mockResolvedValue([]);
    readHome.mockResolvedValue({
      featured: [FEATURED],
      vacancies: [],
      counts: { members: 8, vacancies: 0 },
    });
  });

  it('renders its heading', async () => {
    await renderHome();

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('invites the visitor to the promotions', async () => {
    await renderHome();

    expect(
      screen.getByRole('heading', { name: 'Recibí las promociones de la Cámara' }),
    ).toBeInTheDocument();
  });

  it('shows the featured businesses and the counts the API answers', async () => {
    renderHome();

    expect(
      await screen.findByText('Café Loma Verde', { selector: 'h3, p, a, span' }),
    ).toBeVisible();
    expect(screen.getByText('8')).toBeVisible();
  });

  it('says a section with nothing to show is empty instead of hiding it', async () => {
    await renderHome();

    expect(screen.getByText('Todavía no hay vacantes publicadas.')).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay promociones vigentes.')).toBeInTheDocument();
  });
});
