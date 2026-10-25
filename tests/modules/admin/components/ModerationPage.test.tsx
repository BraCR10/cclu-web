import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { ModerationPage } from '@/modules/admin/components/ModerationPage';
import type { ModeratedContent } from '@/modules/admin/api/moderation';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readModeration = vi.fn();
const takeContentDown = vi.fn();
const restoreContent = vi.fn();

vi.mock('@/modules/admin/api/moderation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/admin/api/moderation')>()),
  readModeration: (kind: string, filters: unknown, page: unknown) =>
    readModeration(kind, filters, page),
  takeContentDown: (kind: string, id: string, reason: string) => takeContentDown(kind, id, reason),
  restoreContent: (kind: string, id: string) => restoreContent(kind, id),
}));

const live: ModeratedContent = {
  id: 'pub1',
  title: 'Café de altura',
  type: 'product',
  status: 'active',
  reason: null,
  member: 'Café La Unión',
  memberId: 'm1',
  publishedAt: '2026-03-01T10:00:00.000Z',
};

const down: ModeratedContent = {
  ...live,
  id: 'pub2',
  title: 'Descuento de verano',
  status: 'inactive',
  reason: 'La foto no corresponde al producto ofrecido.',
};

function renderPage() {
  viewportIsDesktop(true);

  return renderWithIntl(
    <ToastProvider>
      <ModerationPage />
    </ToastProvider>,
  );
}

describe('ModerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readModeration.mockResolvedValue({
      items: [live, down],
      page: 1,
      pageSize: 10,
      total: 2,
      pageCount: 1,
    });
  });

  it('shows each item with its member, its state and the reason when it is down', async () => {
    renderPage();

    expect((await screen.findAllByText('Café de altura')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Café La Unión').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('La foto no corresponde al producto ofrecido.').length,
    ).toBeGreaterThan(0);
  });

  it('asks for a reason before taking anything down', async () => {
    const person = userEvent.setup();
    takeContentDown.mockResolvedValue({ ...live, status: 'inactive' });

    renderPage();

    await screen.findAllByText('Café de altura');
    await person.click(screen.getAllByRole('button', { name: 'Inactivar' })[0]);

    const dialog = await screen.findByRole('dialog');
    await person.type(
      within(dialog).getByLabelText('Motivo'),
      'La foto no corresponde al producto.',
    );
    await person.click(within(dialog).getByRole('button', { name: 'Inactivar' }));

    await waitFor(() =>
      expect(takeContentDown).toHaveBeenCalledWith(
        'products',
        'pub1',
        'La foto no corresponde al producto.',
      ),
    );
    expect(await screen.findByText('Publicación inactivada')).toBeInTheDocument();
  });

  it('puts an inactive item back with one click', async () => {
    const person = userEvent.setup();
    restoreContent.mockResolvedValue({ ...down, status: 'active', reason: null });

    renderPage();

    await screen.findAllByText('Descuento de verano');
    await person.click(screen.getAllByRole('button', { name: 'Reactivar' })[0]);

    await waitFor(() => expect(restoreContent).toHaveBeenCalledWith('products', 'pub2'));
    expect(await screen.findByText('Publicación reactivada')).toBeInTheDocument();
  });

  it('switching tab asks the API for that kind', async () => {
    const person = userEvent.setup();

    renderPage();

    await screen.findAllByText('Café de altura');
    await person.click(screen.getByLabelText('Vacantes'));

    await waitFor(() =>
      expect(readModeration).toHaveBeenCalledWith(
        'vacancies',
        expect.anything(),
        expect.anything(),
      ),
    );
  });
});
