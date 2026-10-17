import type { ReactNode } from 'react';
import { Card } from './Card';

type HelpCardProps = {
  title: string;
  items: string[];
  children?: ReactNode;
};

// The aside that sits beside the form and tells somebody what to have at hand
// before they start. On a telephone it is the same card, above the fields.
export function HelpCard({ title, items, children }: HelpCardProps) {
  return (
    <Card as="section" className="p-6">
      <h2 className="text-heading-s text-fg">{title}</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-body-m text-fg-secondary">
            <span
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {children !== undefined && (
        <div className="mt-4 border-t border-line-subtle pt-4">{children}</div>
      )}
    </Card>
  );
}
