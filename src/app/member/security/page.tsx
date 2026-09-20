'use client';

import { MemberPanelShell } from '@/modules/members/components/MemberPanelShell';
import { PasswordChangeForm } from '@/shared/components/PasswordChangeForm';

export default function MemberSecurityPage() {
  return (
    <MemberPanelShell
      title="Seguridad"
      subtitle="Cambie su contraseña confirmando su identidad con un código enviado a su correo."
      currentPath="/member/security"
    >
      <PasswordChangeForm />
    </MemberPanelShell>
  );
}
