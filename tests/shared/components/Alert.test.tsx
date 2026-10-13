import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Alert } from '@/shared/components/Alert';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Alert', () => {
  it('interrupts with a danger or warning message', () => {
    renderWithIntl(<Alert tone="danger" title="Cambios solicitados" message="Revisá la cédula." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Cambios solicitados');
    expect(screen.getByRole('alert')).toHaveTextContent('Revisá la cédula.');
  });

  it('announces an info or success message politely', () => {
    renderWithIntl(<Alert tone="info" title="En revisión" />);

    expect(screen.getByRole('status')).toHaveTextContent('En revisión');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
