'use client';

import { AdminPanelShell } from '@/modules/admin/components/AdminPanelShell';
import { ApplicationInbox } from '@/modules/admin/components/ApplicationInbox';

export default function AdminApplicationsPage() {
  return (
    <AdminPanelShell
      title="Solicitudes de afiliación"
      subtitle="Revise cada solicitud y decida. La más antigua aparece primero."
      currentPath="/admin"
    >
      <ApplicationInbox />
    </AdminPanelShell>
  );
}
