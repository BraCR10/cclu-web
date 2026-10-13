import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/shared/components/Button';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Button', () => {
  it('runs its action when clicked', async () => {
    const onClick = vi.fn();
    renderWithIntl(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('runs its action from the keyboard', async () => {
    const onClick = vi.fn();
    renderWithIntl(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('button')).toHaveFocus();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is a plain button unless told to submit, so it never submits a form by accident', () => {
    renderWithIntl(<Button>Guardar</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('does nothing while disabled', async () => {
    const onClick = vi.fn();
    renderWithIntl(
      <Button disabled onClick={onClick}>
        Guardar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('says it is busy and ignores clicks while loading', async () => {
    const onClick = vi.fn();
    renderWithIntl(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Guardar/ }));

    expect(screen.getByRole('button', { name: /Guardar/ })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Cargando')).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('paints each variant from its own tokens', () => {
    renderWithIntl(
      <>
        <Button variant="primary">Primario</Button>
        <Button variant="danger">Peligro</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Primario' })).toHaveClass('bg-primary');
    expect(screen.getByRole('button', { name: 'Peligro' })).toHaveClass('bg-danger');
  });

  it('keeps every size at least 44 px tall on mobile', () => {
    renderWithIntl(<Button size="s">Pequeño</Button>);

    expect(screen.getByRole('button')).toHaveClass('min-h-11');
  });
});
