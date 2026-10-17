import type { ReactNode } from 'react';

// A long form on a telephone would push its own action out of reach, so below lg
// the buttons travel with the viewport. From lg the card holds them, and this
// stops being a bar at all.
export function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-line-subtle bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
      {children}
    </div>
  );
}
