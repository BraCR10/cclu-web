import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { THEME_STORAGE_KEY } from '@/shared/theme';

function systemPrefers(scheme: 'light' | 'dark') {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('dark') && scheme === 'dark',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.removeAttribute('data-theme');
  systemPrefers('light');
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.removeItem(THEME_STORAGE_KEY);
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeToggle', () => {
  // The icon shows where the button goes, not where it is.
  it('offers the dark scheme while the screen is light', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Cambiar a tema oscuro' })).toBeTruthy();
  });

  it('offers the light scheme while the screen is dark', () => {
    systemPrefers('dark');
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeTruthy();
  });

  it('writes the choice onto the document, which is what the stylesheet reads', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  // Without this the choice dies on reload, which is the whole point of storing it.
  it('remembers the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Cambiar a tema oscuro' }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('follows the operating system until somebody chooses', () => {
    systemPrefers('dark');
    render(<ThemeToggle />);

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole('button', { name: 'Cambiar a tema claro' })).toBeTruthy();
  });
});
