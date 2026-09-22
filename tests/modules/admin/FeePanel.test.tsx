import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeePanel } from '@/modules/admin/components/FeePanel';

describe('FeePanel', () => {
  it('shows the configured fee', async () => {
    render(<FeePanel loadFee={async () => ({ amount: 15000 })} saveFee={vi.fn()} />);

    expect(await screen.findByText(/₡\s*15/)).toBeTruthy();
  });

  it('says when no fee has been configured yet', async () => {
    render(<FeePanel loadFee={async () => ({ amount: null })} saveFee={vi.fn()} />);

    expect(await screen.findByText('Sin configurar')).toBeTruthy();
  });

  it('refuses an amount that is not a positive number', async () => {
    const saveFee = vi.fn();
    const user = userEvent.setup();

    render(<FeePanel loadFee={async () => ({ amount: null })} saveFee={saveFee} />);

    await screen.findByText('Sin configurar');
    await user.type(screen.getByLabelText('Nuevo monto (₡)'), '-5');
    await user.click(screen.getByRole('button', { name: 'Actualizar cuota' }));

    expect(await screen.findByText('Indique un monto mayor que cero.')).toBeTruthy();
    expect(saveFee).not.toHaveBeenCalled();
  });

  it('saves the new amount and shows it as current', async () => {
    const saveFee = vi.fn().mockResolvedValue({ amount: 20000 });
    const user = userEvent.setup();

    render(<FeePanel loadFee={async () => ({ amount: 15000 })} saveFee={saveFee} />);

    await screen.findByText(/₡\s*15/);
    await user.type(screen.getByLabelText('Nuevo monto (₡)'), '20000');
    await user.click(screen.getByRole('button', { name: 'Actualizar cuota' }));

    await waitFor(() => expect(saveFee).toHaveBeenCalledWith(20000));
    expect(await screen.findByText(/₡\s*20/)).toBeTruthy();
  });
});
