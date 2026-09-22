'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MembershipPanel } from '@/modules/members/components/MembershipPanel';

export default function MemberMembershipPage() {
  return (
    <>
      <PanelHeading
        title="Mi membresía"
        subtitle="Consulte su estado, registre sus pagos y conozca sus beneficios."
      />
      <MembershipPanel />
    </>
  );
}
