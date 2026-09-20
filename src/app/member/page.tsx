'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { ProfileForm } from '@/modules/members/components/ProfileForm';
import { PasswordSection } from '@/shared/components/PasswordSection';

export default function MemberProfilePage() {
  return (
    <>
      <PanelHeading
        title="Mi perfil"
        subtitle="Mantenga sus datos al día: es lo que verá quien lo busque en el directorio."
      />
      <ProfileForm />
      <PasswordSection />
    </>
  );
}
