'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BottomSheet } from '@/shared/components/BottomSheet';
import type { NavigationGroup } from './navigation';
import { useNavigationLabel } from './useNavigationLabel';

type MoreSheetProps = {
  open: boolean;
  title: string;
  groups: readonly NavigationGroup[];
  onClose: () => void;
};

export function MoreSheet({ open, title, groups, onClose }: MoreSheetProps) {
  const labelOf = useNavigationLabel();

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col">
            {group.labelKey && (
              <p className="px-3 pt-2 pb-1 text-label-s text-fg-muted">{labelOf(group.labelKey)}</p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 rounded-md px-3 text-body-l text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                <item.icon aria-hidden className="size-5 text-fg-secondary" />
                <span className="flex-1">{labelOf(item.labelKey)}</span>
                <ChevronRight aria-hidden className="size-5 text-fg-muted" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
