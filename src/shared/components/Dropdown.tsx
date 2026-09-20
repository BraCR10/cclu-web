'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type DropdownProps = {
  label: string;
  button: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
};

export function Dropdown({ label, button, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  // A menu that only closes on its own trigger leaves the page with two things
  // open at once, and Escape is what a keyboard reaches for first.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (container.current !== null && !container.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-control px-2 py-1.5 text-sm transition-colors hover:bg-surface-raised"
      >
        {button}
      </button>

      {open && (
        <div
          role="menu"
          className={`animate-panel-in absolute top-[calc(100%+0.5rem)] z-30 w-72 overflow-hidden rounded-panel border border-border bg-surface-raised shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
