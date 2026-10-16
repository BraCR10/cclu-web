import { classNames } from '@/shared/utils/classNames';

export type SegmentedOption = {
  value: string;
  label: string;
};

type SegmentedControlProps = {
  legend: string;
  name: string;
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
};

// Two choices that change what the form below means, so both stay visible and
// the chosen one is marked rather than hidden behind a menu.
export function SegmentedControl({
  legend,
  name,
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="flex gap-1 rounded-md bg-surface-hover p-1">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={classNames(
                'flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xs px-3 text-label-m transition-colors',
                'has-[:focus-visible]:shadow-focus',
                selected ? 'bg-surface text-fg shadow-raised' : 'text-fg-secondary hover:text-fg',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
