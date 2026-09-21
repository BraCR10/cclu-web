import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobList } from '@/modules/jobs/components/JobList';
import type { Job, JobPage } from '@/modules/jobs/api/jobs';

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
    business: { businessName: 'Panadería Tres Ríos', memberCode: 'MA7K2Q4' },
    ...overrides,
  };
}

function page(overrides: Partial<JobPage> = {}): JobPage {
  return { items: [job()], total: 1, page: 1, limit: 20, hasMore: false, ...overrides };
}

describe('JobList', () => {
  it('lists what the search answers with', async () => {
    render(<JobList search={vi.fn(async () => page())} />);

    expect(await screen.findByText('Panadero')).toBeTruthy();
    expect(screen.getByText('Panadería Tres Ríos')).toBeTruthy();
  });

  it('says so when there are no vacancies for the filter', async () => {
    render(<JobList search={async () => page({ items: [], total: 0 })} />);

    expect(await screen.findByText(/No hay vacantes publicadas/)).toBeTruthy();
  });

  it('reports a search it could not complete', async () => {
    render(
      <JobList
        search={async () => {
          throw new Error('network');
        }}
      />,
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('sends the chosen contract type as a filter', async () => {
    const search = vi.fn(async () => page());
    const user = userEvent.setup();

    render(<JobList search={search} />);

    await screen.findByText('Panadero');
    await user.selectOptions(screen.getByLabelText('Jornada'), 'internship');

    await waitFor(() =>
      expect(search).toHaveBeenLastCalledWith({ page: 1, contractType: 'internship' }),
    );
  });

  it('does not offer a next page once there is nothing more', async () => {
    render(<JobList search={async () => page({ hasMore: false })} />);

    await screen.findByText('Panadero');
    const next = screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement;

    expect(next.disabled).toBe(true);
  });
});
