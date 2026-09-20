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

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
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

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, readServerChoice);

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

  return { choice, choose };
}
