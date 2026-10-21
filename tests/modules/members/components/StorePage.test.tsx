import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/shared/components/ToastProvider';
import { StorePage } from '@/modules/members/components/StorePage';
import type { Store } from '@/modules/members/api/store';
import { renderWithIntl } from '../../../support/renderWithIntl';
import { viewportIsDesktop } from '../../../support/viewport';

const readStore = vi.fn();
const saveStore = vi.fn();

vi.mock('@/modules/members/api/store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/store')>()),
  readStore: () => readStore(),
  saveStore: (changes: unknown) => saveStore(changes),
}));

vi.mock('@/modules/members/api/registration', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/modules/members/api/registration')>()),
  readActivities: async () => [
    { _id: '65f0c3a1b2c3d4e5f6a7b8cb', name: 'Cafeterías' },
    { _id: '65f0c3a1b2c3d4e5f6a7b8cc', name: 'Panaderías' },
  ],
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/member/profile/store' }));

const SHOP: Store = {
  businessDescription: 'Café y tostaduría de altura.',
  categories: [],
  instagram: '@cafelomaverde',
  facebook: null,
  linkedin: null,
  website: null,
  schedule: [
    { day: 'monday', closed: false, opensAt: '07:00', closesAt: '18:00' },
    { day: 'tuesday', closed: true },
    { day: 'wednesday', closed: true },
    { day: 'thursday', closed: true },
    { day: 'friday', closed: true },
    { day: 'saturday', closed: true },
    { day: 'sunday', closed: true },
  ],
};

function renderPage() {
  return renderWithIntl(
    <ToastProvider>
      <StorePage />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  viewportIsDesktop(false);
  readStore.mockResolvedValue(SHOP);
  saveStore.mockResolvedValue(SHOP);
});

describe('the shop screen', () => {
  it('shows what the shop says about itself and its week', async () => {
    renderPage();

    expect(await screen.findByDisplayValue('Café y tostaduría de altura.')).toBeVisible();
    expect(screen.getByDisplayValue('@cafelomaverde')).toBeVisible();
    // Seven days, each with the closed switch the prototype draws.
    expect(screen.getAllByLabelText('Cerrado')).toHaveLength(7);
  });

  it('saves the description the member wrote', async () => {
    const user = userEvent.setup();
    renderPage();

    const description = await screen.findByDisplayValue('Café y tostaduría de altura.');

    await user.clear(description);
    await user.type(description, 'Café de altura tostado en casa.');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(saveStore).toHaveBeenCalledWith(
        expect.objectContaining({ businessDescription: 'Café de altura tostado en casa.' }),
      ),
    );
  });

  // The week travels whole: the days the screen shows are the days the API
  // stores, and a closed one carries no hours.
  it('sends the whole week, with a closed day carrying no hours', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Café y tostaduría de altura.');

    const [mondayClosed] = screen.getAllByLabelText('Cerrado', { selector: 'input' });

    await user.click(mondayClosed);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(saveStore).toHaveBeenCalled());

    const [{ schedule }] = saveStore.mock.calls[0] as [{ schedule: unknown[] }];

    expect(schedule).toHaveLength(7);
    expect(schedule[0]).toEqual({ day: 'monday', closed: true });
    expect(schedule[1]).toEqual({ day: 'tuesday', closed: true });
  });

  it('opens a day with its hours', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Café y tostaduría de altura.');

    const [, tuesdayClosed] = screen.getAllByLabelText('Cerrado', { selector: 'input' });

    await user.click(tuesdayClosed);

    const from = screen.getAllByLabelText('Desde')[1];
    const to = screen.getAllByLabelText('Hasta')[1];

    await user.type(from, '08:00');
    await user.type(to, '12:00');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(saveStore).toHaveBeenCalled());

    const [{ schedule }] = saveStore.mock.calls[0] as [{ schedule: unknown[] }];

    expect(schedule[1]).toEqual({
      day: 'tuesday',
      closed: false,
      opensAt: '08:00',
      closesAt: '12:00',
    });
  });

  it('adds a category and takes it off again', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Café y tostaduría de altura.');

    await user.selectOptions(screen.getByLabelText('Categorías'), '65f0c3a1b2c3d4e5f6a7b8cb');

    expect(screen.getByRole('button', { name: 'Cafeterías' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Cafeterías' }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(saveStore).toHaveBeenCalledWith(expect.objectContaining({ categories: [] })),
    );
  });
});
