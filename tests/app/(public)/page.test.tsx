import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Home from '@/app/(public)/page';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Home', () => {
  it('renders its heading', () => {
    renderWithIntl(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });
});
