import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/(site)/page';
import {
  JOIN_ENTRY,
  SECTION_STATUS,
  SECTION_STATUS_LABELS,
  SIGN_IN_ENTRIES,
  SITE_SECTIONS,
} from '@/shared/config/siteNavigation';

function hrefsOnScreen(): string[] {
  return screen.getAllByRole('link').map((link) => link.getAttribute('href') ?? '');
}

describe('Home', () => {
  // The point of this screen is that nothing in the platform is unreachable
  // from it. A section nobody can navigate to may as well not be built.
  it('offers a way into every section of the platform', () => {
    render(<Home />);

    const hrefs = hrefsOnScreen();

    for (const section of SITE_SECTIONS) {
      expect(hrefs).toContain(section.href);
    }
  });

  it('offers both ways to sign in and the way to ask for an account', () => {
    render(<Home />);

    const hrefs = hrefsOnScreen();

    for (const entry of SIGN_IN_ENTRIES) {
      expect(hrefs).toContain(entry.href);
    }

    expect(hrefs).toContain(JOIN_ENTRY.href);
  });

  // A section that is not finished has to say so here, or somebody follows the
  // link expecting it to work.
  it('says which sections are not finished rather than letting them look ready', () => {
    render(<Home />);

    for (const section of SITE_SECTIONS) {
      if (section.status === SECTION_STATUS.AVAILABLE) {
        continue;
      }

      expect(screen.getAllByText(SECTION_STATUS_LABELS[section.status]).length).toBeGreaterThan(0);
    }
  });

  it('explains the three steps between asking to join and holding a card', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 2, name: 'Cómo afiliarse' })).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(SITE_SECTIONS.length + 3);
  });
});
