import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyJobsPanel } from '@/modules/jobs/components/MyJobsPanel';
import type { Job } from '@/modules/jobs/api/jobs';

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: 'j1',
    title: 'Panadero',
    description: 'Se busca panadero con experiencia.',
    requirements: 'Dos años de experiencia.',
    howToApply: 'Escriba al correo del comercio.',
    contractType: 'full_time',
    location: 'La Unión',
    contactEmail: null,
    contactPhone: null,
    isActive: true,
    createdAt: '2026-03-04T12:00:00.000Z',
    business: null,
    ...overrides,
  };
}

const paidMembership = {
  type: 'paid' as const,
  paidUntil: '2026-12-31T00:00:00.000Z',
  feeAmount: 15000,
  benefits: { free: [], paid: [] },
};
const loadPaid = async () => paidMembership;

describe('MyJobsPanel', () => {
  it('lists the postings it is given', async () => {
    render(<MyJobsPanel loadMembership={loadPaid} loadJobs={async () => [job()]} />);

    expect(await screen.findByText('Panadero')).toBeTruthy();
    expect(screen.getByText(/Abierta/)).toBeTruthy();
  });

  it('says so when there is nothing published yet', async () => {
    render(<MyJobsPanel loadMembership={loadPaid} loadJobs={async () => []} />);

    expect(await screen.findByText(/Todavía no ha publicado/)).toBeTruthy();
  });

  it('reports a list it could not load', async () => {
    render(
      <MyJobsPanel
        loadJobs={async () => {
          throw new Error('network');
        }}
      />,
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('offers no closing action for a posting already closed', async () => {
    render(
      <MyJobsPanel loadMembership={loadPaid} loadJobs={async () => [job({ isActive: false })]} />,
    );

    await screen.findByText('Panadero');

    expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
  });

  it('closes an open posting and refreshes the list', async () => {
    const removeJob = vi.fn().mockResolvedValue(undefined);
    const loadJobs = vi
      .fn()
      .mockResolvedValueOnce([job()])
      .mockResolvedValue([job({ isActive: false })]);
    const user = userEvent.setup();

    render(<MyJobsPanel loadMembership={loadPaid} loadJobs={loadJobs} removeJob={removeJob} />);

    await screen.findByText(/Abierta/);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    await waitFor(() => expect(removeJob).toHaveBeenCalledWith('j1'));
    expect(await screen.findByText(/Cerrada/)).toBeTruthy();
  });

  it('opens the form to publish a new posting', async () => {
    const user = userEvent.setup();

    render(<MyJobsPanel loadMembership={loadPaid} loadJobs={async () => []} />);

    await screen.findByText(/Todavía no ha publicado/);
    await user.click(screen.getByRole('button', { name: 'Publicar vacante' }));

    expect(screen.getByLabelText('Puesto')).toBeTruthy();
  });
});
