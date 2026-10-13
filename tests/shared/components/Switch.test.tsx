import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '@/shared/components/Switch';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Switch', () => {
  it('reports its state and flips when pressed', async () => {
    const onChange = vi.fn();
    renderWithIntl(<Switch label="Mostrar en el directorio" checked={false} onChange={onChange} />);

    const control = screen.getByRole('switch', { name: 'Mostrar en el directorio' });
    await userEvent.click(control);

    expect(control).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('flips from the keyboard', async () => {
    const onChange = vi.fn();
    renderWithIntl(<Switch label="Mostrar" checked onChange={onChange} />);

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does nothing while disabled', async () => {
    const onChange = vi.fn();
    renderWithIntl(<Switch label="Mostrar" checked={false} disabled onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
