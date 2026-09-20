'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { PasswordChangeForm } from '@/shared/components/PasswordChangeForm';

export default function AdminSecurityPage() {
  return (
    <>
      <PanelHeading
        title="Seguridad"
        subtitle="Cambie su contraseña confirmando su identidad con un código enviado a su correo."
      />
      <PasswordChangeForm />
    </>
  );
}
