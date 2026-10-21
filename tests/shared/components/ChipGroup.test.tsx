import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChipGroup } from '@/shared/components/ChipGroup';

const CHIPS = [
  { value: 'pending', label: 'Por revisar' },
  { value: 'approved', label: 'Aprobados' },
];

describe('ChipGroup', () => {
  it('marks only the selected chip as pressed', () => {
    render(<ChipGroup label="Estado" chips={CHIPS} selected="approved" onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: 'Aprobados' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Por revisar' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('answers the value of the chip a person chooses', async () => {
    const onSelect = vi.fn();
    render(<ChipGroup label="Estado" chips={CHIPS} selected="pending" onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'Aprobados' }));

    expect(onSelect).toHaveBeenCalledWith('approved');
  });
});
