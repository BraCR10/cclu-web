'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'cclu-theme';

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

// The attribute is the only thing the stylesheet reads. Absent means the
// operating system decides, which is what "system" means.
export function applyThemeChoice(choice: ThemeChoice, root: HTMLElement): void {
  if (choice === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', choice);
}

// Runs before the first paint, inlined in the document head. Without it the
// page paints with the system scheme and then corrects itself, which is a flash
// of the wrong colours on every load.
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c==='light'||c==='dark'){document.documentElement.setAttribute('data-theme',c)}}catch(e){}})()`;

// Browser storage is state this component does not own, so it is read as an
// external store rather than copied into an effect. That also makes a change in
// another tab arrive here without a reload.
const listeners = new Set<() => void>();

const SYSTEM_DARK = '(prefers-color-scheme: dark)';

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  // While nobody has chosen, the operating system decides, so a change there
  // has to reach the control too.
  const media = window.matchMedia(SYSTEM_DARK);
  media.addEventListener('change', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
    media.removeEventListener('change', listener);
  };
}

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemeChoice(stored) ? stored : 'system';
  } catch {
    // A browser that refuses storage still gets the system scheme.
    return 'system';
  }
}

// Nothing is stored yet when the server renders, so the answer there is the one
// the document already carries.
function readServerChoice(): ThemeChoice {
  return 'system';
}

export type ResolvedTheme = 'light' | 'dark';

// What is actually on screen right now, which is not the same as what was
// chosen: "system" resolves to whatever the operating system says.
function readResolved(): ResolvedTheme {
  const choice = readChoice();

  if (choice !== 'system') {
    return choice;
  }

  try {
    return window.matchMedia(SYSTEM_DARK).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function readServerResolved(): ResolvedTheme {
  return 'light';
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, readServerChoice);
  const resolved = useSyncExternalStore(subscribe, readResolved, readServerResolved);

  const choose = useCallback((next: ThemeChoice) => {
    applyThemeChoice(next, document.documentElement);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The choice holds for this page either way.
    }

    for (const listener of listeners) {
      listener();
    }
  }, []);

  // One button, so it moves to the opposite of what is on screen. Choosing is
  // what ends the operating system's say; there is no way back to it here, and
  // nobody has ever asked for one.
  const toggle = useCallback(() => {
    choose(readResolved() === 'dark' ? 'light' : 'dark');
  }, [choose]);

  return { choice, resolved, choose, toggle };
}
