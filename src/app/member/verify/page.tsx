'use client';

import { MemberPanelShell } from '@/modules/members/components/MemberPanelShell';
import { CodeVerifier } from '@/modules/members/components/CodeVerifier';

export default function VerifyMemberCodePage() {
  return (
    <MemberPanelShell
      title="Verificar código"
      subtitle="Confirme que un código pertenece a un afiliado antes de aplicarle un descuento."
      currentPath="/member/verify"
    >
      <CodeVerifier />
    </MemberPanelShell>
  );
}
