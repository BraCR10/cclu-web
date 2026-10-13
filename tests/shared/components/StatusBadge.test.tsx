import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('StatusBadge', () => {
  it('shows its label in the colours of its tone', () => {
    renderWithIntl(<StatusBadge tone="danger" label="Rechazada" />);

    expect(screen.getByText('Rechazada').parentElement).toHaveClass(
      'bg-danger-soft',
      'text-danger',
    );
  });

  it('does not rely on colour alone: the state is always written', () => {
    renderWithIntl(<StatusBadge tone="success" label="Aprobada" />);

    expect(screen.getByText('Aprobada')).toBeVisible();
  });
});
