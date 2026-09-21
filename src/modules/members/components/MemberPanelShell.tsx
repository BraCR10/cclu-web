'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/shared/auth/useSession';
import { useRequireRole } from '@/shared/auth/useRequireRole';
import { SIGN_IN_PATH } from '@/shared/auth/sessionApi';
import { RequireRole } from '@/shared/auth/RequireRole';
import { ROLES } from '@/shared/auth/roles';
import { PanelShell } from '@/shared/components/PanelShell';
import { ProfileMenu } from '@/shared/components/ProfileMenu';
import { NotificationsMenu } from '@/shared/components/NotificationsMenu';
import {
  BadgeCheckIcon,
  GiftIcon,
  GlobeIcon,
  IdCardIcon,
  InboxIcon,
  PercentIcon,
  TagIcon,
  UserIcon,
  WalletIcon,
} from '@/shared/components/icons';
import { formatMemberCode } from '@/shared/format';

export const MEMBER_NAVIGATION = [
  { href: '/member', label: 'Mi perfil', Icon: UserIcon },
  { href: '/member/membership', label: 'Mi membresía', Icon: WalletIcon },
  { href: '/member/card', label: 'Mi carné', Icon: IdCardIcon },
  { href: '/member/marketplace', label: 'Mi marketplace', Icon: GlobeIcon },
  { href: '/member/promotions', label: 'Mis promociones', Icon: TagIcon },
  { href: '/member/discounts', label: 'Mis descuentos', Icon: PercentIcon },
  { href: '/member/jobs', label: 'Mis vacantes', Icon: InboxIcon },
  { href: '/member/benefits', label: 'Descuentos de afiliados', Icon: GiftIcon },
  { href: '/member/verify', label: 'Verificar código', Icon: BadgeCheckIcon },
];

type MemberPanelShellProps = {
  children: ReactNode;
};

export function MemberPanelShell({ children }: MemberPanelShellProps) {
  const session = useSession();

  useRequireRole(session, { allow: [ROLES.MEMBER], signInPath: SIGN_IN_PATH });

  return (
    <PanelShell
      sectionLabel="Panel del agremiado"
      navigation={MEMBER_NAVIGATION}
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
