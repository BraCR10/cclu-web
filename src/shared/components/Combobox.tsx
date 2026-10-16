import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { FieldMessage } from './FieldMessage';
import { classNames } from '@/shared/utils/classNames';

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  label: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  help?: string;
  error?: string;
};

// A list long enough that reading it is work, so it is searched rather than
// scrolled. A native select cannot be typed into, which is why this exists.
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder,
  emptyMessage,
  help,
  error,
}: ComboboxProps) {
  const listId = `${useId()}-list`;
  const messageId = `${listId}-message`;
  const container = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const selected = options.find((option) => option.value === value);
  const typed = query.trim().toLowerCase();
  const matches =
    typed === '' ? options : options.filter((option) => option.label.toLowerCase().includes(typed));

  // Clicking anywhere else closes the list, which is what every other select on
  // the page does and what a person expects when they move on.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeOnOutsidePress(event: MouseEvent) {
      if (container.current !== null && !container.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('mousedown', closeOnOutsidePress);

    return () => document.removeEventListener('mousedown', closeOnOutsidePress);
  }, [open]);

  function choose(option: ComboboxOption) {
    onChange(option.value);
    setOpen(false);
    setQuery('');
    setHighlighted(0);
  }

  return (
    <div ref={container} className="relative">
      <span className="text-label-m text-fg" id={`${listId}-label`}>
        {label}
      </span>

      <div
        className={classNames(
          'mt-2 flex h-10 items-center gap-2 rounded-sm border bg-surface px-3',
          error === undefined ? 'border-line' : 'border-danger',
        )}
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-fg-muted" />

        {open ? (
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-labelledby={`${listId}-label`}
            aria-activedescendant={
              matches[highlighted] === undefined
                ? undefined
                : `${listId}-${matches[highlighted].value}`
            }
            value={query}
            placeholder={selected?.label ?? placeholder}
            className="h-full min-w-0 flex-1 bg-transparent text-body-m text-fg outline-none"
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlighted(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlighted((current) => Math.min(current + 1, matches.length - 1));
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlighted((current) => Math.max(current - 1, 0));
              }

              if (event.key === 'Enter') {
                event.preventDefault();

                const option = matches[highlighted];

                if (option !== undefined) {
                  choose(option);
                }
              }

              if (event.key === 'Escape') {
                setOpen(false);
                setQuery('');
              }
            }}
          />
        ) : (
          <button
            type="button"
            role="combobox"
            aria-expanded="false"
            aria-controls={listId}
            aria-labelledby={`${listId}-label`}
            aria-describedby={error === undefined ? undefined : messageId}
            className="h-full min-w-0 flex-1 text-left text-body-m text-fg"
            onClick={() => setOpen(true)}
          >
            {selected === undefined ? (
              <span className="text-fg-muted">{placeholder}</span>
            ) : (
              selected.label
            )}
          </button>
        )}

        <button
          type="button"
          tabIndex={-1}
          aria-label={label}
          className="shrink-0 text-fg-muted"
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={`${listId}-label`}
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-sm border border-line bg-surface py-1 shadow-overlay"
        >
          {matches.length === 0 && (
            <li className="px-3 py-2 text-body-m text-fg-muted">{emptyMessage}</li>
          )}

          {matches.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              className={classNames(
                'cursor-pointer px-3 py-2 text-body-m',
                index === highlighted ? 'bg-surface-hover' : 'bg-surface',
                option.value === value ? 'text-fg-brand' : 'text-fg',
              )}
              onMouseEnter={() => setHighlighted(index)}
              onMouseDown={(event) => {
                // Pressed before the field loses focus, so the choice survives.
                event.preventDefault();
                choose(option);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {(error !== undefined || help !== undefined) && (
        <div className="mt-2">
          <FieldMessage id={messageId} error={error} help={help} />
        </div>
      )}
    </div>
  );
}
