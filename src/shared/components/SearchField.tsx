import { Search } from 'lucide-react';

type SearchFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
};

const DEFAULT_MAXIMUM_LENGTH = 100;

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  maxLength = DEFAULT_MAXIMUM_LENGTH,
}: SearchFieldProps) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
      />
      <input
        type="search"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-sm border border-line bg-surface pr-3 pl-9 text-body-m text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
      />
    </label>
  );
}
