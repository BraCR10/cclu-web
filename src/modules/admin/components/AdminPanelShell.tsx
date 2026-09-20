'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/shared/auth/useSession';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { ADMIN_SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { PanelShell } from '@/shared/components/PanelShell';
import { ProfileMenu } from '@/shared/components/ProfileMenu';
import { InboxIcon, ShieldIcon } from '@/shared/components/icons';
import { AdminNotifications } from './AdminNotifications';

export const ADMIN_NAVIGATION = [
  { href: '/admin', label: 'Solicitudes', Icon: InboxIcon },
  { href: '/admin/security', label: 'Seguridad', Icon: ShieldIcon },
];

type AdminPanelShellProps = {
  title: string;
  subtitle?: string;
  currentPath: string;
  children: ReactNode;
};

export function AdminPanelShell({ title, subtitle, currentPath, children }: AdminPanelShellProps) {
  const session = useSession();

  useRequireSession(session, { signInPath: ADMIN_SIGN_IN_PATH });

  const isAdministrator =
    session.status === 'authenticated' && session.identity.role === ROLES.ADMIN;

  return (
    <PanelShell
      sectionLabel="Panel administrativo"
      title={title}
      subtitle={subtitle}
      navigation={ADMIN_NAVIGATION}
      currentPath={currentPath}
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
        {children}
      </RequireRole>
    </PanelShell>
  );
}
