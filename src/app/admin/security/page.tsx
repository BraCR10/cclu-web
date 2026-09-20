'use client';

import { AdminPanelShell } from '@/modules/admin/components/AdminPanelShell';
import { PasswordChangeForm } from '@/shared/components/PasswordChangeForm';

export default function AdminSecurityPage() {
  return (
    <AdminPanelShell
      title="Seguridad"
      subtitle="Cambie su contraseña confirmando su identidad con un código enviado a su correo."
      currentPath="/admin/security"
    >
      <PasswordChangeForm />
    </AdminPanelShell>
  );
}
