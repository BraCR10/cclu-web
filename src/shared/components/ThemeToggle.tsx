'use client';

import { useTheme } from '@/shared/theme';
import type { ThemeChoice } from '@/shared/theme';
import { MoonIcon, SunIcon, SystemIcon } from './icons';

const OPTIONS: { choice: ThemeChoice; label: string; Icon: typeof SunIcon }[] = [
  { choice: 'light', label: 'Claro', Icon: SunIcon },
  { choice: 'dark', label: 'Oscuro', Icon: MoonIcon },
  { choice: 'system', label: 'Automático', Icon: SystemIcon },
];

export function ThemeToggle() {
  const { choice, choose } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className="flex items-center gap-0.5 rounded-pill border border-border p-0.5"
    >
      {OPTIONS.map(({ choice: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={choice === option}
          aria-label={label}
          title={label}
          onClick={() => choose(option)}
          className={`flex size-7 items-center justify-center rounded-pill transition-colors ${
            choice === option ? 'bg-brand text-on-brand' : 'text-content-muted hover:text-content'
          }`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
