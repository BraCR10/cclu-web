import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobForm } from '@/modules/jobs/components/JobForm';
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

describe('JobForm', () => {
  it('refuses to submit without a title or a description', async () => {
    const create = vi.fn();
    const user = userEvent.setup();

    render(<JobForm onSaved={vi.fn()} create={create} />);

    await user.click(screen.getByRole('button', { name: 'Publicar vacante' }));

    await waitFor(() =>
      expect(document.getElementById('title-error')?.textContent).toContain(
        'Este dato es obligatorio.',
      ),
    );

    for (const field of ['description', 'requirements', 'howToApply']) {
      expect(document.getElementById(`${field}-error`)?.textContent).toContain(
        'Este dato es obligatorio.',
      );
    }

    expect(create).not.toHaveBeenCalled();
  });

  it('creates a posting with what was filled in', async () => {
    const create = vi.fn().mockResolvedValue(job());
    const onSaved = vi.fn();
    const user = userEvent.setup();

    render(<JobForm onSaved={onSaved} create={create} />);

    await user.type(screen.getByLabelText('Puesto'), 'Panadero');
    await user.type(screen.getByLabelText('Descripción'), 'Se busca panadero con experiencia.');
    await user.type(screen.getByLabelText('Requisitos'), 'Dos años de experiencia.');
    await user.type(screen.getByLabelText(/Cómo aplicar/), 'Escriba al correo del comercio.');
    await user.click(screen.getByRole('button', { name: 'Publicar vacante' }));

    await waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(create.mock.calls[0][0]).toMatchObject({
      title: 'Panadero',
      description: 'Se busca panadero con experiencia.',
      contractType: 'full_time',
    });
    expect(onSaved).toHaveBeenCalledWith(job());
  });

  it('starts from the posting being edited and saves through update', async () => {
    const update = vi.fn().mockResolvedValue(job({ title: 'Panadero senior' }));
    const user = userEvent.setup();

    render(<JobForm job={job()} onSaved={vi.fn()} update={update} />);

    const title = screen.getByLabelText('Puesto') as HTMLInputElement;
    expect(title.value).toBe('Panadero');

    await user.clear(title);
    await user.type(title, 'Panadero senior');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        'j1',
        expect.objectContaining({ title: 'Panadero senior' }),
      ),
    );
  });

  it('reports a save that failed', async () => {
    const create = vi.fn().mockRejectedValue(new Error('network'));
    const user = userEvent.setup();

    render(<JobForm onSaved={vi.fn()} create={create} />);

    await user.type(screen.getByLabelText('Puesto'), 'Panadero');
    await user.type(screen.getByLabelText('Descripción'), 'Se busca panadero con experiencia.');
    await user.type(screen.getByLabelText('Requisitos'), 'Dos años de experiencia.');
    await user.type(screen.getByLabelText(/Cómo aplicar/), 'Escriba al correo del comercio.');
    await user.click(screen.getByRole('button', { name: 'Publicar vacante' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('calls onCancel instead of saving anything', async () => {
    const onCancel = vi.fn();
    const create = vi.fn();
    const user = userEvent.setup();

    render(<JobForm onSaved={vi.fn()} onCancel={onCancel} create={create} />);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });
});
