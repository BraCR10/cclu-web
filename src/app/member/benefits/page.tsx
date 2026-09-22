'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { DiscountCatalog } from '@/modules/marketplace/components/DiscountCatalog';

export default function MemberBenefitsPage() {
  return (
    <>
      <PanelHeading
        title="Descuentos de afiliados"
        subtitle="Beneficios exclusivos que otros comercios de la Cámara ofrecen a los agremiados."
      />
      <DiscountCatalog />
    </>
  );
}
