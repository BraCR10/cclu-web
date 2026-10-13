import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('UnderConstruction', () => {
  it('says the section is not built yet', () => {
    renderWithIntl(<UnderConstruction />);

    expect(screen.getByRole('heading', { name: 'En construcción' })).toBeDefined();
    expect(screen.getByText('Esta sección todavía no está disponible.')).toBeDefined();
  });
});
