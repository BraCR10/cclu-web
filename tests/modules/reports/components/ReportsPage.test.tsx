import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsPage } from '@/modules/reports/components/ReportsPage';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readReportCatalog = vi.fn();
const readReport = vi.fn();
const exportReport = vi.fn();

vi.mock('@/modules/reports/api/reports', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/reports/api/reports')>()),
  readReportCatalog: () => readReportCatalog(),
  readReport: (...args: unknown[]) => readReport(...args),
  exportReport: (...args: unknown[]) => exportReport(...args),
}));

vi.mock('@/shared/api/catalogs', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api/catalogs')>()),
  readCantons: async () => [{ _id: 'canton-1', name: 'La Unión', province: 'Cartago' }],
  readActivities: async () => [],
  readDistricts: async () => ({ districts: ['San Juan'] }),
}));

vi.mock('@/shared/utils/saveFile', () => ({ saveFile: vi.fn() }));

const CATALOG = {
  items: [
    {
      type: 'paidMembers',
      title: 'Afiliados con membresía paga',
      filters: ['canton', 'plan'],
      available: true,
    },
    {
      type: 'periodPayments',
      title: 'Pagos del período',
      filters: ['from', 'to'],
      available: true,
    },
    { type: 'promotions', title: 'Promociones activas', filters: [], available: false },
  ],
};

const REPORT = {
  type: 'paidMembers',
  title: 'Afiliados con membresía paga',
  description: 'Generado el 21 oct 2026, 12:30',
  summary: [{ label: 'Total', value: '1' }],
  columns: ['Comercio', 'Código', 'Plan'],
  items: [['Café Loma Verde', 'CLU001', 'Pro Pymex']],
  page: 1,
  pageSize: 10,
  total: 1,
  pageCount: 1,
};

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <ReportsPage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(true);
  readReportCatalog.mockResolvedValue(CATALOG);
  readReport.mockResolvedValue(REPORT);
  exportReport.mockResolvedValue(new Blob(['x']));
});

describe('the reports screen', () => {
  it('generates the chosen report and shows its totals and rows', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Generar reporte' }));

    expect((await screen.findAllByText('Café Loma Verde')).length).toBeGreaterThan(0);
    expect(screen.getByText('Total')).toBeVisible();
    expect(readReport).toHaveBeenCalledWith('paidMembers', { canton: '', plan: '' }, 1);
  });

  it('offers only the filters the chosen report takes', async () => {
    renderPage();

    expect(await screen.findByRole('combobox', { name: 'Plan' })).toBeVisible();
    expect(screen.queryByLabelText('Desde')).toBeNull();
  });

  it('marks a report over publications not built yet as unavailable', async () => {
    renderPage();

    expect(await screen.findByRole('radio', { name: /Promociones activas/ })).toBeDisabled();
  });

  it('exports what was generated, as CSV or PDF', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Generar reporte' }));
    await screen.findAllByText('Café Loma Verde');
    await user.click(screen.getByRole('button', { name: 'Exportar PDF' }));

    expect(exportReport).toHaveBeenCalledWith('paidMembers', { canton: '', plan: '' }, 'pdf');
  });

  it('on a telephone the report type counts only once applied', async () => {
    const user = userEvent.setup();
    viewportIsDesktop(false);
    renderPage();

    await user.click(await screen.findByRole('button', { name: /Tipo de reporte/ }));
    const sheet = screen.getByRole('dialog', { name: 'Tipo de reporte' });
    await user.click(within(sheet).getByRole('radio', { name: /Pagos del período/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Aplicar' }));
    await user.click(screen.getByRole('button', { name: 'Generar reporte' }));

    expect(readReport).toHaveBeenCalledWith('periodPayments', { from: '', to: '' }, 1);
  });
});
