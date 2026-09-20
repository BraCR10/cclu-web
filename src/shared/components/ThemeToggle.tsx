'use client';

import { useTheme } from '@/shared/theme';
import { MoonIcon, SunIcon } from './icons';

// The icon shows where the button goes, not where it is: a sun on a dark screen
// is the way back to light.
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const goingToDark = resolved === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={goingToDark ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
      title={goingToDark ? 'Tema oscuro' : 'Tema claro'}
      className="flex size-9 items-center justify-center rounded-pill text-content-muted transition-colors hover:bg-surface-raised hover:text-content"
    >
      {goingToDark ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
    </button>
  );
}
