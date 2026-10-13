import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import { Modal } from '@/shared/components/Modal';
import { renderWithIntl } from '../../support/renderWithIntl';

function viewportIsDesktop(isDesktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: isDesktop,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Modal', () => {
  it('is a popup on desktop', () => {
    viewportIsDesktop(true);
    renderWithIntl(
      <Modal open title="Motivo" onClose={() => {}}>
        Contenido
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Motivo' })).toHaveAttribute(
      'data-presentation',
      'popup',
    );
  });

  it('is a bottom sheet on mobile', () => {
    viewportIsDesktop(false);
    renderWithIntl(
      <Modal open title="Motivo" onClose={() => {}}>
        Contenido
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Motivo' })).toHaveAttribute(
      'data-presentation',
      'sheet',
    );
  });
});
