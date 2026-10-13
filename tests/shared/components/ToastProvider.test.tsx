import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { useToast } from '@/shared/components/useToast';
import { renderWithIntl } from '../../support/renderWithIntl';

function Trigger({ tone = 'success' as const }: { tone?: 'success' | 'error' | 'info' }) {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast({ tone, title: 'Pago aprobado', message: 'Listo.' })}
    >
      Mostrar
    </button>
  );
}

function renderTrigger(tone?: 'success' | 'error' | 'info') {
  renderWithIntl(
    <ToastProvider>
      <Trigger tone={tone} />
    </ToastProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('shows a toast in a live region when asked', async () => {
    renderTrigger();

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Pago aprobado');
    expect(screen.getByRole('status')).toHaveTextContent('Listo.');
  });

  it('announces an error toast assertively', async () => {
    renderTrigger('error');

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Pago aprobado');
  });

  it('closes a toast from its close button', async () => {
    renderTrigger();

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByText('Pago aprobado')).not.toBeInTheDocument();
  });

  it('dismisses a toast on its own after a few seconds', () => {
    vi.useFakeTimers();
    renderTrigger();

    act(() => screen.getByRole('button', { name: 'Mostrar' }).click());
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(6000));
    expect(screen.queryByText('Pago aprobado')).not.toBeInTheDocument();
  });

  it('refuses to be used outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderWithIntl(<Trigger />)).toThrow(/ToastProvider/);

    consoleError.mockRestore();
  });
});
