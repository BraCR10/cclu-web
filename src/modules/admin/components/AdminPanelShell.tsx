'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/shared/auth/useSession';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { ADMIN_SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { PanelShell } from '@/shared/components/PanelShell';
import { ProfileMenu } from '@/shared/components/ProfileMenu';
import { InboxIcon, UserIcon } from '@/shared/components/icons';
import { AdminNotifications } from './AdminNotifications';

export const ADMIN_NAVIGATION = [
  { href: '/admin', label: 'Solicitudes', Icon: InboxIcon },
  { href: '/admin/profile', label: 'Mi perfil', Icon: UserIcon },
];

type AdminPanelShellProps = {
  children: ReactNode;
};

export function AdminPanelShell({ children }: AdminPanelShellProps) {
  const session = useSession();

  useRequireSession(session, { signInPath: ADMIN_SIGN_IN_PATH });

  const isAdministrator =
    session.status === 'authenticated' && session.identity.role === ROLES.ADMIN;

  return (
    <PanelShell
      sectionLabel="Panel administrativo"
      navigation={ADMIN_NAVIGATION}
      headerEnd={
        <>
          {isAdministrator && <AdminNotifications />}
          {session.status === 'authenticated' && (
            <ProfileMenu
              displayName={session.identity.displayName}
              email={session.identity.email}
              roleLabel="Administrador"
              links={[{ href: '/admin/profile', label: 'Mi perfil' }]}
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
