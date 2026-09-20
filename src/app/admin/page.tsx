'use client';

import { useSession } from '@/shared/auth/useSession';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { ADMIN_SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { PanelShell } from '@/shared/components/PanelShell';
import { ProfileMenu } from '@/shared/components/ProfileMenu';
import { InboxIcon } from '@/shared/components/icons';
import { AdminNotifications } from '@/modules/admin/components/AdminNotifications';
import { ApplicationInbox } from '@/modules/admin/components/ApplicationInbox';

const NAVIGATION = [{ href: '/admin', label: 'Solicitudes', Icon: InboxIcon }];

export default function AdminApplicationsPage() {
  const session = useSession();

  useRequireSession(session, { signInPath: ADMIN_SIGN_IN_PATH });

  const isAdministrator =
    session.status === 'authenticated' && session.identity.role === ROLES.ADMIN;

  return (
    <PanelShell
      sectionLabel="Panel administrativo"
      title="Solicitudes de afiliación"
      subtitle="Revise cada solicitud y decida. La más antigua aparece primero."
      navigation={NAVIGATION}
      currentPath="/admin"
      headerEnd={
        <>
          {isAdministrator && <AdminNotifications />}
          {session.status === 'authenticated' && (
            <ProfileMenu
              displayName={session.identity.displayName}
              email={session.identity.email}
              roleLabel="Administrador"
              onSignOut={session.signOut}
            />
          )}
        </>
      }
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
    </PanelShell>
  );
}
