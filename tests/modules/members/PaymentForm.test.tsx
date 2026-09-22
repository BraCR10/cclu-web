import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from '@/modules/members/components/PaymentForm';
import type { Payment } from '@/modules/members/api/membership';

const registered: Payment = {
  id: 'p1',
  paidAt: '2026-09-20',
  detail: null,
  amount: 15000,
  status: 'pending_review',
  statusReason: null,
  reviewedAt: null,
  receiptUrl: null,
  createdAt: '2026-09-20T12:00:00.000Z',
};

function receiptFile(): File {
  return new File([new Uint8Array(8)], 'comprobante.png', { type: 'image/png' });
}

describe('PaymentForm', () => {
  it('refuses to send without a receipt and a date', async () => {
    const register = vi.fn();
    const user = userEvent.setup();

    render(<PaymentForm feeAmount={15000} onRegistered={vi.fn()} register={register} />);

    await user.click(screen.getByRole('button', { name: 'Registrar pago' }));

    expect(await screen.findByText(/Adjunte la foto o el PDF/)).toBeTruthy();
    expect(register).not.toHaveBeenCalled();
  });

  it('sends the receipt with its content type, the date and the detail', async () => {
    const register = vi.fn().mockResolvedValue(registered);
    const onRegistered = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <PaymentForm feeAmount={15000} onRegistered={onRegistered} register={register} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, receiptFile());
    await screen.findByText('comprobante.png');

    const paidAt = screen.getByLabelText('Fecha del pago') as HTMLInputElement;
    await user.type(paidAt, '2026-09-20');
    await user.type(screen.getByLabelText('Detalle'), 'Transferencia SINPE');

    await user.click(screen.getByRole('button', { name: 'Registrar pago' }));

    await waitFor(() => expect(register).toHaveBeenCalledOnce());
    expect(register.mock.calls[0][0]).toMatchObject({
      contentType: 'image/png',
      paidAt: '2026-09-20',
      detail: 'Transferencia SINPE',
    });
    expect(typeof register.mock.calls[0][0].content).toBe('string');
    expect(onRegistered).toHaveBeenCalledWith(registered);
  });

  it('says the fee is not configured when there is none', () => {
    render(<PaymentForm feeAmount={null} onRegistered={vi.fn()} register={vi.fn()} />);

    expect(screen.getByText(/aún no ha configurado el monto/)).toBeTruthy();
  });

  it('reports a registration that failed', async () => {
    const register = vi.fn().mockRejectedValue(new Error('network'));
    const user = userEvent.setup();

    const { container } = render(
      <PaymentForm feeAmount={15000} onRegistered={vi.fn()} register={register} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, receiptFile());
    await screen.findByText('comprobante.png');
    await user.type(screen.getByLabelText('Fecha del pago'), '2026-09-20');
    await user.click(screen.getByRole('button', { name: 'Registrar pago' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});
