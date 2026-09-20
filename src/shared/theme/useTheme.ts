'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  THEME_STORAGE_KEY,
  applyThemeChoice,
  isThemeChoice,
  type ThemeChoice,
} from './themeChoice';

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
