import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Avatar, initialsOf } from '@/shared/components/Avatar';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('Café Loma Verde')).toBe('CL');
  });

  it('takes one letter from a single word', () => {
    expect(initialsOf('Hostal')).toBe('H');
  });

  it('ignores extra spaces and keeps accented letters', () => {
    expect(initialsOf('  ángel   rojas ')).toBe('ÁR');
  });

  it('answers nothing for an empty name', () => {
    expect(initialsOf('   ')).toBe('');
  });
});

describe('Avatar', () => {
  it('shows the image with the name as its description', () => {
    renderWithIntl(<Avatar name="Café Loma Verde" src="/logo.png" />);

    expect(screen.getByRole('img', { name: 'Café Loma Verde' })).toHaveAttribute(
      'src',
      '/logo.png',
    );
  });

  it('shows the initials when there is no image, still named for assistive technology', () => {
    renderWithIntl(<Avatar name="Café Loma Verde" />);

    expect(screen.getByRole('img', { name: 'Café Loma Verde' })).toHaveTextContent('CL');
  });
});
