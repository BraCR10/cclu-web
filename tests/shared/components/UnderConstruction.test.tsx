import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('UnderConstruction', () => {
  it('says the section is not built yet, with no caption under it', () => {
    renderWithIntl(<UnderConstruction />);

    expect(screen.getByRole('heading', { name: 'En construcción' })).toBeDefined();
  });
});

describe('UnderConstruction inside a panel', () => {
  it('sits below the panel title as a second level heading', () => {
    renderWithIntl(<UnderConstruction headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2, name: 'En construcción' })).toBeDefined();
  });
});
