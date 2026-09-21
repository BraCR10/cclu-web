import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsPanel } from '@/modules/admin/components/ReportsPanel';
import type { Report } from '@/modules/admin/api/reports';

const CANTONS = [{ _id: 'c1', name: 'La Unión', province: 'Cartago' }];
const SECTORS = [{ _id: 's1', name: 'Comercio' }];

const memberReport: Report = {
  type: 'members',
  total: 1,
  rows: [
    {
      businessName: 'Panadería Tres Ríos',
      memberCode: 'MA7K2Q4',
      email: 'socio@example.cr',
      canton: 'La Unión',
      sector: 'Comercio',
      membership: 'paid',
    },
  ],
};

const jobsReport: Report = {
  type: 'jobs',
  total: 1,
  rows: [
    {
      title: 'Panadero',
      businessName: 'Panadería Tres Ríos',
      canton: 'La Unión',
      sector: 'Comercio',
      createdAt: '2026-09-01T00:00:00.000Z',
    },
  ],
};

function renderPanel(
  loadReport: (typeof ReportsPanel extends (p: infer P) => unknown ? P : never)['loadReport'],
) {
  return render(
    <ReportsPanel
      loadReport={loadReport}
      loadCantons={async () => CANTONS}
      loadSectors={async () => SECTORS}
    />,
  );
}

describe('ReportsPanel', () => {
  it('generates a member report with its rows and total', async () => {
    const loadReport = vi.fn().mockResolvedValue(memberReport);
    const user = userEvent.setup();

    renderPanel(loadReport);

    await user.click(screen.getByRole('button', { name: 'Generar reporte' }));

    expect(await screen.findByText('Panadería Tres Ríos')).toBeTruthy();
    expect(screen.getByText('1 resultado')).toBeTruthy();
    expect(screen.getByText('Paga')).toBeTruthy();
    expect(loadReport).toHaveBeenCalledWith('members', {});
  });

  it('sends the chosen type and filters', async () => {
    const loadReport = vi.fn().mockResolvedValue(jobsReport);
    const user = userEvent.setup();

    renderPanel(loadReport);

    await user.selectOptions(screen.getByLabelText('Tipo de reporte'), 'jobs');
    await waitFor(() =>
      expect((screen.getByLabelText('Cantón') as HTMLSelectElement).options.length).toBeGreaterThan(
        1,
      ),
    );
    await user.selectOptions(screen.getByLabelText('Cantón'), 'c1');
    await user.click(screen.getByRole('button', { name: 'Generar reporte' }));

    await waitFor(() => expect(loadReport).toHaveBeenCalledWith('jobs', { canton: 'c1' }));
    expect(await screen.findByText('Panadero')).toBeTruthy();
  });

  it('reports a generation that failed', async () => {
    const loadReport = vi.fn().mockRejectedValue(new Error('network'));
    const user = userEvent.setup();

    renderPanel(loadReport);

    await user.click(screen.getByRole('button', { name: 'Generar reporte' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
