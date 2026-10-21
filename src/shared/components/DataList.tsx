import type { ReactNode } from 'react';
import { classNames } from '@/shared/utils/classNames';
import { Avatar } from './Avatar';

// The first cell of most panel rows: who the row is about.
export function NameCell({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} size="s" />
      <div className="min-w-0">
        <p className="truncate text-body-m text-fg">{name}</p>
        <p className="text-body-s text-fg-muted">{detail}</p>
      </div>
    </div>
  );
}

export type DataColumn<Item> = {
  id: string;
  header: string;
  cell: (item: Item) => ReactNode;
  align?: 'start' | 'end';
  // The header is still read out, so a column of buttons keeps its name.
  hideHeader?: boolean;
};

type DataListProps<Item> = {
  label: string;
  items: Item[];
  keyOf: (item: Item) => string;
  columns: DataColumn<Item>[];
  card: (item: Item) => ReactNode;
};

const FRAME_CLASSES =
  'overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised';

// A panel list: a table from the desktop breakpoint, a stack of cards below it.
export function DataList<Item>({ label, items, keyOf, columns, card }: DataListProps<Item>) {
  return (
    <>
      <ul aria-label={label} className={`divide-y divide-line-subtle lg:hidden ${FRAME_CLASSES}`}>
        {items.map((item) => (
          <li key={keyOf(item)}>{card(item)}</li>
        ))}
      </ul>

      <div className={`hidden lg:block ${FRAME_CLASSES}`}>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{label}</caption>
          <thead className="bg-surface-subtle">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={classNames(
                    'px-4 py-3 text-label-s text-fg-secondary',
                    column.align === 'end' && 'text-right',
                  )}
                >
                  {column.hideHeader ? (
                    <span className="sr-only">{column.header}</span>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={keyOf(item)} className="border-t border-line-subtle">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={classNames(
                      'px-4 py-3 text-body-m text-fg',
                      column.align === 'end' && 'text-right',
                    )}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
