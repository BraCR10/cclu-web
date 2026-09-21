'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MyDiscountsPanel } from '@/modules/marketplace/components/MyDiscountsPanel';

export default function MemberDiscountsPage() {
  return (
    <>
      <PanelHeading
        title="Mis descuentos"
        subtitle="Publique y administre los descuentos que ofrece a otros afiliados."
      />
      <MyDiscountsPanel />
    </>
  );
}
