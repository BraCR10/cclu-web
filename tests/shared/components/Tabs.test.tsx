import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from '@/shared/components/Tabs';
import { renderWithIntl } from '../../support/renderWithIntl';

const items = [
  { id: 'products', label: 'Productos', content: 'Lista de productos' },
  { id: 'offers', label: 'Ofertas', content: 'Lista de ofertas' },
  { id: 'jobs', label: 'Empleos', content: 'Lista de empleos' },
];

describe('Tabs', () => {
  it('shows the first panel and marks its tab selected', () => {
    renderWithIntl(<Tabs label="Secciones" items={items} />);

    expect(screen.getByRole('tab', { name: 'Productos' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Productos' })).toHaveTextContent(
      'Lista de productos',
    );
  });

  it('switches panels when a tab is clicked', async () => {
    renderWithIntl(<Tabs label="Secciones" items={items} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Ofertas' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Lista de ofertas');
  });

  it('moves with the arrow keys and wraps around the ends', async () => {
    renderWithIntl(<Tabs label="Secciones" items={items} />);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Empleos' })).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Lista de empleos');

    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Productos' })).toHaveFocus();
  });

  it('jumps to the first and last tab with Home and End', async () => {
    renderWithIntl(<Tabs label="Secciones" items={items} />);

    await userEvent.tab();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Empleos' })).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Productos' })).toHaveFocus();
  });

  it('keeps only the selected tab in the tab order', () => {
    renderWithIntl(<Tabs label="Secciones" items={items} />);

    expect(screen.getByRole('tab', { name: 'Ofertas' })).toHaveAttribute('tabindex', '-1');
  });
});
