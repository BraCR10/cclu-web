'use client';

import { MemberPanelShell } from '@/modules/members/components/MemberPanelShell';
import { MemberCard } from '@/modules/members/components/MemberCard';

export default function MemberCardPage() {
  return (
    <MemberPanelShell
      title="Mi carné"
      subtitle="Muéstrelo para acreditar su afiliación. Quien escanee el código llega a su ficha pública."
      currentPath="/member/card"
    >
      <MemberCard />
    </MemberPanelShell>
  );
}
