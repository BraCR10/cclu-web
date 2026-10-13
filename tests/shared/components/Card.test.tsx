import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Card } from '@/shared/components/Card';
import { renderWithIntl } from '../../support/renderWithIntl';

describe('Card', () => {
  it('renders as the element it is asked for', () => {
    renderWithIntl(
      <Card as="article" aria-label="Café Loma Verde">
        Contenido
      </Card>,
    );

    expect(screen.getByRole('article', { name: 'Café Loma Verde' })).toHaveTextContent('Contenido');
  });
});
