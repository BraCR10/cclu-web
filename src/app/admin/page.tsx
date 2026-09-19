'use client';

import { useSession } from '@/shared/auth/useSession';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { ADMIN_SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { AdminShell } from '@/modules/admin/components/AdminShell';
import { ApplicationInbox } from '@/modules/admin/components/ApplicationInbox';

export default function AdminApplicationsPage() {
  const session = useSession();

  useRequireSession(session, { signInPath: ADMIN_SIGN_IN_PATH });

  return (
    <AdminShell
      title="Solicitudes de afiliación"
      subtitle="Revise cada solicitud y decida. La más antigua aparece primero."
      onSignOut={session.signOut}
    >
      <RequireRole
        session={session}
        allow={[ROLES.ADMIN]}
        fallback={
          <p className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
            Esta sección es únicamente para administradores de la Cámara.
          </p>
        }
      >
        <ApplicationInbox />
      </RequireRole>
    </AdminShell>
  );
}
