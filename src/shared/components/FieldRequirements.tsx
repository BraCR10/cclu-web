'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertIcon } from './icons';

type FieldRequirementsProps = {
  // What was refused, and what the field asks for. Both live in the note rather
  // than below the control, where a new line pushes the rest of the form down
  // every time somebody makes a mistake.
  message: string;
  requirements: string[];
};

// The mark that stands for a refusal, carrying the reason and the rule behind
// it. Hover is not the way in: a telephone has no pointer, and the registration
// form is the one people fill on a telephone. It is a button first, and
// hovering is an extra where a pointer exists.
export function FieldRequirements({ message, requirements }: FieldRequirementsProps) {
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

  return (
    <span ref={container} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Ver qué pasa con este dato"
        onClick={() => setPinned((current) => !current)}
        onMouseEnter={() => setPointedAt(true)}
        onMouseLeave={() => setPointedAt(false)}
        onFocus={() => setPointedAt(true)}
        onBlur={() => setPointedAt(false)}
        className="inline-flex rounded-pill text-danger"
      >
        <AlertIcon className="size-4 shrink-0" />
      </button>

      {open && (
        <span
          role="note"
          className="animate-panel-in absolute top-[calc(100%+0.5rem)] right-0 z-30 w-64 rounded-panel border border-border bg-surface-raised p-3 text-left shadow-xl"
        >
          <span className="block text-sm font-medium text-danger">{message}</span>

          {requirements.length > 0 && (
            <span className="mt-3 block border-t border-border pt-3">
              <span className="mb-1.5 block text-xs font-medium tracking-wide text-content-muted uppercase">
                Requisitos
              </span>

              <span className="flex flex-col gap-1.5">
                {requirements.map((requirement) => (
                  <span
                    key={requirement}
                    className="flex items-start gap-2 text-sm font-normal text-content"
                  >
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-pill bg-support" />
                    {requirement}
                  </span>
                ))}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
}
