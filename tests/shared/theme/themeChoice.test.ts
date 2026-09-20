import { describe, it, expect } from 'vitest';
import {
  THEME_BOOTSTRAP_SCRIPT,
  applyThemeChoice,
  isThemeChoice,
} from '@/shared/theme/themeChoice';

describe('isThemeChoice', () => {
  it('accepts only the three the stylesheet knows', () => {
    for (const value of ['system', 'light', 'dark']) {
      expect(isThemeChoice(value)).toBe(true);
    }

    for (const value of [null, undefined, '', 'Dark', 'blue', 0]) {
      expect(isThemeChoice(value)).toBe(false);
    }
  });
});

describe('applyThemeChoice', () => {
  it('names the scheme on the document when a person chose one', () => {
    const root = document.createElement('html');

    applyThemeChoice('dark', root);
    expect(root.getAttribute('data-theme')).toBe('dark');

    applyThemeChoice('light', root);
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  // Absent is what "system" means to the stylesheet, so choosing it has to
  // remove the attribute rather than write the word.
  it('removes the attribute for the system choice', () => {
    const root = document.createElement('html');

    applyThemeChoice('dark', root);
    applyThemeChoice('system', root);

    expect(root.hasAttribute('data-theme')).toBe(false);
  });
});

describe('THEME_BOOTSTRAP_SCRIPT', () => {
  it('applies a stored choice before the first paint', () => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    window.localStorage.setItem('cclu-theme', 'dark');

    eval(THEME_BOOTSTRAP_SCRIPT);

    expect(root.getAttribute('data-theme')).toBe('dark');
    window.localStorage.removeItem('cclu-theme');
    root.removeAttribute('data-theme');
  });

  it('writes nothing when no choice was stored', () => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    window.localStorage.removeItem('cclu-theme');

    eval(THEME_BOOTSTRAP_SCRIPT);

    expect(root.hasAttribute('data-theme')).toBe(false);
  });
});
