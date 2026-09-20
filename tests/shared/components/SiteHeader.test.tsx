import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from '@/shared/components/SiteHeader';
import { JOIN_ENTRY, SIGN_IN_ENTRIES, SITE_SECTIONS } from '@/shared/config/siteNavigation';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

// The header carries the theme control, which asks the operating system what it
// prefers. jsdom has no answer to that on its own.
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

async function openEntries() {
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: 'Opciones de ingreso' }));

  return user;
}

describe('SiteHeader', () => {
  it('offers a way into every section of the platform', () => {
    render(<SiteHeader />);

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));

    for (const section of SITE_SECTIONS) {
      expect(hrefs).toContain(section.href);
    }
  });

  it('gathers both ways in and the way to ask for an account in one menu', async () => {
    render(<SiteHeader />);
    await openEntries();

    for (const entry of SIGN_IN_ENTRIES) {
      expect(screen.getByRole('menuitem', { name: new RegExp(entry.label) })).toBeTruthy();
    }

    expect(screen.getByRole('menuitem', { name: new RegExp(JOIN_ENTRY.label) })).toBeTruthy();
  });

  // The two sign in entries say what they are. Somebody choosing this one has
  // no account at all, and the label alone does not say what it involves.
  it('explains the affiliation entry, which is the only one that needs it', async () => {
    render(<SiteHeader />);
    await openEntries();

    expect(screen.getByText(JOIN_ENTRY.description)).toBeTruthy();
  });
});
