'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/shared/auth/useSession';
import { useRequireSession } from '@/shared/auth/useRequireSession';
import { SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { PanelShell } from '@/shared/components/PanelShell';
import { ProfileMenu } from '@/shared/components/ProfileMenu';
import { NotificationsMenu } from '@/shared/components/NotificationsMenu';
import { BadgeCheckIcon, ShieldIcon, UserIcon } from '@/shared/components/icons';
import { formatMemberCode } from '@/shared/format';

export const MEMBER_NAVIGATION = [
  { href: '/member', label: 'Mi perfil', Icon: UserIcon },
  { href: '/member/verify', label: 'Verificar código', Icon: BadgeCheckIcon },
  { href: '/member/security', label: 'Seguridad', Icon: ShieldIcon },
];

type MemberPanelShellProps = {
  title: string;
  subtitle?: string;
  currentPath: string;
  children: ReactNode;
};

export function MemberPanelShell({
  title,
  subtitle,
  currentPath,
  children,
}: MemberPanelShellProps) {
  const session = useSession();

  useRequireSession(session, { signInPath: SIGN_IN_PATH });

  return (
    <PanelShell
      sectionLabel="Panel del agremiado"
      title={title}
      subtitle={subtitle}
      navigation={MEMBER_NAVIGATION}
      currentPath={currentPath}
      headerEnd={
        <>
          <NotificationsMenu notices={[]} emptyMessage="No tiene avisos pendientes." />

          {session.status === 'authenticated' && (
            <ProfileMenu
              displayName={session.identity.displayName}
              email={session.identity.email}
              roleLabel="Agremiado"
              memberCode={
                session.identity.memberCode
                  ? formatMemberCode(session.identity.memberCode)
                  : undefined
              }
              links={[{ href: '/member', label: 'Mi perfil' }]}
              onSignOut={session.signOut}
            />
          )}
        </>
      }
    >
      <RequireRole
        session={session}
        allow={[ROLES.MEMBER]}
        fallback={
          <p className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
            Esta sección es únicamente para agremiados de la Cámara.
          </p>
        }
      >
        {children}
      </RequireRole>
    </PanelShell>
  );
}
