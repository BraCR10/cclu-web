'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MyPromotionsPanel } from '@/modules/marketplace/components/MyPromotionsPanel';

export default function MemberPromotionsPage() {
  return (
    <>
      <PanelHeading
        title="Mis promociones"
        subtitle="Publique y administre las promociones de su negocio."
      />
      <MyPromotionsPanel />
    </>
  );
}
