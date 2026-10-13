'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { classNames } from '@/shared/utils/classNames';

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProps = {
  label: string;
  items: TabItem[];
  defaultSelectedId?: string;
};

function nextIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export function Tabs({ label, items, defaultSelectedId }: TabsProps) {
  const baseId = useId();
  const [selectedId, setSelectedId] = useState(defaultSelectedId ?? items[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(
    items.findIndex((item) => item.id === selectedId),
    0,
  );
  const selected = items[selectedIndex];

  // Selection follows focus, the pattern for panels that are already rendered.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = nextIndex(event.key, selectedIndex, items.length);

    if (target === null) {
      return;
    }

    event.preventDefault();
    setSelectedId(items[target].id);
    tabRefs.current[target]?.focus();
  }

  if (!selected) {
    return null;
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="flex gap-6 overflow-x-auto border-b border-line-subtle"
      >
        {items.map((item, index) => {
          const isSelected = item.id === selected.id;

          return (
            <button
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedId(item.id)}
              className={classNames(
                '-mb-px min-h-11 shrink-0 border-b-2 px-1 text-label-m whitespace-nowrap',
                'focus-visible:shadow-focus focus-visible:outline-none',
                isSelected
                  ? 'border-primary text-fg-brand'
                  : 'border-transparent text-fg-secondary hover:text-fg',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${selected.id}`}
        aria-labelledby={`${baseId}-tab-${selected.id}`}
        tabIndex={0}
        className="pt-4 focus-visible:shadow-focus focus-visible:outline-none"
      >
        {selected.content}
      </div>
    </div>
  );
}
