import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home', () => {
  it('renders its heading', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
  });
});
