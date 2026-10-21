import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Home from '@/app/(public)/page';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { renderWithIntl } from '../../support/renderWithIntl';
import { viewportIsDesktop } from '../../support/viewport';

function renderHome() {
  return renderWithIntl(
    <ToastProvider>
      <Home />
    </ToastProvider>,
  );
}

describe('Home', () => {
  beforeEach(() => {
    viewportIsDesktop(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders its heading', () => {
    renderHome();

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });

  it('invites the visitor to the promotions', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: 'Recibí las promociones de la Cámara' }),
    ).toBeInTheDocument();
  });
});
