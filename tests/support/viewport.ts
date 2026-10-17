import { vi } from 'vitest';

// jsdom ships no matchMedia, so a component that asks whether it is on a laptop
// would throw rather than answer. A test says which screen it is instead, and
// unstubs it afterwards.
export function viewportIsDesktop(isDesktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: isDesktop,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}
