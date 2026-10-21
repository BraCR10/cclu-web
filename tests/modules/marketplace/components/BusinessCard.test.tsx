import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DirectoryListing } from '@/modules/marketplace/api/directory';
import { BusinessCard } from '@/modules/marketplace/components/BusinessCard';
import { renderWithIntl } from '../../../support/renderWithIntl';

const LISTING: DirectoryListing = {
  memberCode: 'M-W85A-0Q',
  businessName: 'Café Loma Verde',
  activity: 'Cafetería y tostadora',
  logoFileKey: null,
  plan: { key: 'pro', name: 'Pro Pymex' },
  branch: { name: 'Sucursal San Juan', district: 'San Juan' },
  otherBranches: 2,
  online: false,
};

describe('BusinessCard', () => {
  it('opens the public page of the business', () => {
    renderWithIntl(<BusinessCard listing={LISTING} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/directory/M-W85A-0Q');
  });

  it('names the first branch and how many more the business has', () => {
    renderWithIntl(<BusinessCard listing={LISTING} />);

    expect(screen.getByText('Sucursal San Juan')).toBeInTheDocument();
    expect(screen.getByText('+2 sucursales')).toBeInTheDocument();
  });

  it('says a business with no door is online', () => {
    renderWithIntl(
      <BusinessCard listing={{ ...LISTING, branch: null, otherBranches: 0, online: true }} />,
    );

    expect(screen.getByText('En línea')).toBeInTheDocument();
    expect(screen.queryByText(/sucursal/)).not.toBeInTheDocument();
  });

  it('shows no plan badge for a business on Gratuita', () => {
    renderWithIntl(<BusinessCard listing={{ ...LISTING, plan: null }} />);

    expect(screen.queryByText('Pro Pymex')).not.toBeInTheDocument();
  });
});
