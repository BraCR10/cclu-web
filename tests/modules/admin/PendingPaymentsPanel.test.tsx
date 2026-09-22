import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PendingPaymentsPanel } from '@/modules/admin/components/PendingPaymentsPanel';
import { MESSAGES } from '@/shared/config/messages';
import type { PendingPayment } from '@/modules/admin/api/payments';

function payment(overrides: Partial<PendingPayment> = {}): PendingPayment {
  return {
    id: 'p1',
    paidAt: '2026-09-15T00:00:00.000Z',
    detail: 'Transferencia SINPE',
    amount: 15000,
    status: 'pending_review',
    statusReason: null,
    reviewedAt: null,
    receiptUrl: 'https://storage.example/receipt',
    createdAt: '2026-09-15T12:00:00.000Z',
    member: {
      id: 'm1',
      businessName: 'Panadería Tres Ríos',
      memberCode: 'MA7K2Q4',
      email: 'socio@example.cr',
    },
    ...overrides,
  };
}

describe('PendingPaymentsPanel', () => {
  it('lists the pending payments with member and receipt', async () => {
    render(<PendingPaymentsPanel loadPayments={async () => [payment()]} />);

    expect(await screen.findByText('Panadería Tres Ríos')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ver comprobante' }).getAttribute('href')).toBe(
      'https://storage.example/receipt',
    );
  });

  it('says so when there is nothing waiting', async () => {
    render(<PendingPaymentsPanel loadPayments={async () => []} />);

    expect(await screen.findByText(/No hay pagos pendientes/)).toBeTruthy();
  });

  it('approves a payment and refreshes the queue', async () => {
    const approve = vi.fn().mockResolvedValue({});
    const loadPayments = vi.fn().mockResolvedValueOnce([payment()]).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<PendingPaymentsPanel loadPayments={loadPayments} approve={approve} />);

    await screen.findByText('Panadería Tres Ríos');
    await user.click(screen.getByRole('button', { name: 'Aprobar' }));

    await waitFor(() => expect(approve).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText(/No hay pagos pendientes/)).toBeTruthy();
  });

  it('requires a reason before rejecting', async () => {
    const reject = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();

    render(<PendingPaymentsPanel loadPayments={async () => [payment()]} reject={reject} />);

    await screen.findByText('Panadería Tres Ríos');
    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() =>
      expect(document.getElementById('reject-reason-p1-error')?.textContent).toContain(
        MESSAGES.required,
      ),
    );
    expect(reject).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Motivo del rechazo'), 'El comprobante no se lee.');
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(reject).toHaveBeenCalledWith('p1', 'El comprobante no se lee.'));
  });
});
