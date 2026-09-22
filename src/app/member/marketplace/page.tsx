'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MyListingsPanel } from '@/modules/marketplace/components/MyListingsPanel';

export default function MemberMarketplacePage() {
  return (
    <>
      <PanelHeading
        title="Mi marketplace"
        subtitle="Publique y administre los productos o servicios de su negocio."
      />
      <MyListingsPanel />
    </>
  );
}
