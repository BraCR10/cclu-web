import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MembershipPanel } from '@/modules/members/components/MembershipPanel';
import type { Membership, Payment } from '@/modules/members/api/membership';

function membership(overrides: Partial<Membership> = {}): Membership {
  return {
    type: 'free',
    paidUntil: null,
    feeAmount: 15000,
    benefits: {
      free: ['Aparecer en el directorio', 'Carné digital con código QR'],
      paid: ['Publicar productos y servicios', 'Publicar vacantes'],
    },
    ...overrides,
  };
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'p1',
    paidAt: '2026-09-01T00:00:00.000Z',
    detail: null,
    amount: 15000,
    status: 'pending_review',
    statusReason: null,
    reviewedAt: null,
    receiptUrl: 'https://storage.example/receipt',
    createdAt: '2026-09-01T12:00:00.000Z',
    ...overrides,
  };
}

describe('MembershipPanel', () => {
  it('names the free membership and locks the paid benefits', async () => {
    render(
      <MembershipPanel loadMembership={async () => membership()} loadPayments={async () => []} />,
    );

    expect(await screen.findByText('Membresía gratuita')).toBeTruthy();
    expect(screen.getByText('Con la membresía paga')).toBeTruthy();
    expect(screen.getAllByTitle('Requiere membresía paga').length).toBe(2);
  });

  it('names the paid membership with its validity and no locks', async () => {
    render(
      <MembershipPanel
        loadMembership={async () =>
          membership({ type: 'paid', paidUntil: '2026-10-21T00:00:00.000Z' })
        }
        loadPayments={async () => []}
      />,
    );

    expect(await screen.findByText('Membresía paga')).toBeTruthy();
    expect(screen.queryByTitle('Requiere membresía paga')).toBeNull();
  });

  it('lists the payment history with its states and the rejection reason', async () => {
    render(
      <MembershipPanel
        loadMembership={async () => membership()}
        loadPayments={async () => [
          payment(),
          payment({ id: 'p2', status: 'rejected', statusReason: 'El comprobante no se lee.' }),
        ]}
      />,
    );

    expect(await screen.findByText('Pendiente de revisión')).toBeTruthy();
    expect(screen.getByText('Rechazado')).toBeTruthy();
    expect(screen.getByText(/El comprobante no se lee/)).toBeTruthy();
  });

  it('says so when the membership could not be loaded', async () => {
    render(
      <MembershipPanel
        loadMembership={async () => {
          throw new Error('network');
        }}
        loadPayments={async () => []}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain('No fue posible cargar');
  });

  it('shows the configured fee inside the payment form', async () => {
    render(
      <MembershipPanel loadMembership={async () => membership()} loadPayments={async () => []} />,
    );

    expect(await screen.findByText(/cuota mensual vigente es de/)).toBeTruthy();
  });
});
