'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertIcon, QuestionIcon } from './icons';

type FieldRequirementsProps = {
  requirements: string[];
  // The alert variant replaces the icon beside a refusal; the help variant sits
  // next to the label while the field is still fine.
  tone?: 'help' | 'alert';
};

// Hover is not the way in. A telephone has no pointer to hover with, and the
// registration form is the one people fill on a telephone. The mark is a button
// first, and hovering is an extra where a pointer exists.
export function FieldRequirements({ requirements, tone = 'help' }: FieldRequirementsProps) {
  // Two reasons to be open, kept apart. Sharing one flag meant hovering opened
  // the note and the click that followed toggled it straight back shut.
  const [pinned, setPinned] = useState(false);
  const [pointedAt, setPointedAt] = useState(false);
  const container = useRef<HTMLSpanElement>(null);
  const open = pinned || pointedAt;

  function close() {
    setPinned(false);
    setPointedAt(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (container.current !== null && !container.current.contains(event.target as Node)) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const Icon = tone === 'alert' ? AlertIcon : QuestionIcon;

  return (
    <span ref={container} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Ver los requisitos de este dato"
        onClick={() => setPinned((current) => !current)}
        onMouseEnter={() => setPointedAt(true)}
        onMouseLeave={() => setPointedAt(false)}
        onFocus={() => setPointedAt(true)}
        onBlur={() => setPointedAt(false)}
        className={`inline-flex rounded-pill transition-colors ${
          tone === 'alert' ? 'text-danger' : 'text-content-muted hover:text-content'
        }`}
      >
        <Icon className="size-4 shrink-0" />
      </button>

      {open && (
        <span
          role="note"
          className="animate-panel-in absolute top-[calc(100%+0.5rem)] left-0 z-30 w-64 rounded-panel border border-border bg-surface-raised p-3 text-left shadow-xl"
        >
          <span className="mb-1.5 block text-xs font-medium tracking-wide text-content-muted uppercase">
            Requisitos
          </span>

          <span className="flex flex-col gap-1.5">
            {requirements.map((requirement) => (
              <span key={requirement} className="flex items-start gap-2 text-sm font-normal">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-pill bg-support" />
                {requirement}
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}
