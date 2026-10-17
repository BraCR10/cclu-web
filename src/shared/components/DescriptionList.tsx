import type { ReactNode } from 'react';

export type Description = {
  term: string;
  detail: ReactNode;
};

export function DescriptionList({ items }: { items: Description[] }) {
  return (
    <dl className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.term}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
        >
          <dt className="text-body-m text-fg-muted">{item.term}</dt>
          <dd className="text-body-m text-fg">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
