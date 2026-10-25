import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SummaryKpis } from '@/modules/admin/components/SummaryKpis';
import type { AdminSummary } from '@/modules/admin/api/summary';
import { renderWithIntl } from '../../../support/renderWithIntl';

const summary: AdminSummary = {
  members: { total: 84, newThisMonth: 3 },
  applications: { pending: 5, oldestSubmittedAt: '2026-09-24T15:00:00.000Z' },
  payments: { pending: 2, oldestSubmittedAt: null },
  paidMemberships: { active: 61, newThisMonth: 4 },
  membershipsByPlan: [],
  publications: { active: 24 },
  vacancies: { active: 9 },
  expiring: { items: [], total: 0, noticeDays: 7 },
};

describe('SummaryKpis', () => {
  // Every figure is read from the API now that the publications are built: none
  // of them is a placeholder standing in for something that does not exist.
  it('shows each figure as a number, with none left under construction', () => {
    renderWithIntl(<SummaryKpis summary={summary} />);

    for (const figure of ['84', '5', '2', '61', '24', '9']) {
      expect(screen.getByText(figure)).toBeTruthy();
    }

    expect(screen.queryByText(/en construcción/)).toBeNull();
  });

  it('sends each figure to the screen that lists it', () => {
    renderWithIntl(<SummaryKpis summary={summary} />);

    const links: Array<[string, string]> = [
      ['Agremiados', '/admin/members'],
      ['Solicitudes pendientes', '/admin/applications'],
      ['Pagos por revisar', '/admin/payments'],
      ['Membresías pagadas activas', '/admin/memberships'],
      ['Publicaciones activas', '/admin/moderation'],
      ['Vacantes activas', '/jobs'],
    ];

    for (const [label, href] of links) {
      const link = screen.getByRole('link', { name: new RegExp(label) });

      expect(link.getAttribute('href')).toBe(href);
    }
  });
});
