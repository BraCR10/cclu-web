import { Check } from 'lucide-react';
import { classNames } from '@/shared/utils/classNames';

export type Chip<Value extends string> = { value: Value; label: string };

type ChipGroupProps<Value extends string> = {
  label: string;
  chips: Chip<Value>[];
  selected: Value;
  onSelect: (value: Value) => void;
};

// One choice among a few, such as the state a panel list shows. On a telephone
// the row scrolls sideways rather than wrapping into several lines.
export function ChipGroup<Value extends string>({
  label,
  chips,
  selected,
  onSelect,
}: ChipGroupProps<Value>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0"
    >
      {chips.map((chip) => {
        const isSelected = chip.value === selected;

        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(chip.value)}
            className={classNames(
              'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-9',
              isSelected
                ? 'border-primary bg-brand-union-soft text-fg-brand'
                : 'border-line bg-surface text-fg hover:bg-surface-hover',
            )}
          >
            {isSelected && <Check aria-hidden className="size-4" />}
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
