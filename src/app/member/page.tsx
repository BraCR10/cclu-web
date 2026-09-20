'use client';

import { MemberPanelShell } from '@/modules/members/components/MemberPanelShell';
import { ProfileForm } from '@/modules/members/components/ProfileForm';

export default function MemberProfilePage() {
  return (
    <MemberPanelShell
      title="Mi perfil"
      subtitle="Mantenga sus datos al día: es lo que verá quien lo busque en el directorio."
      currentPath="/member"
    >
      <ProfileForm />
    </MemberPanelShell>
  );
}
