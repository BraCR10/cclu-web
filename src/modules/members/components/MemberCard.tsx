'use client';

import { useCallback, useEffect, useState } from 'react';
import { AffiliateCard } from '@/shared/components/AffiliateCard';
import { MEMBER_TYPE_LABELS } from '@/modules/admin/applicationRules';
import { fetchOwnProfile, MEMBER_STATES, type MemberProfile } from '../api/profile';
import { MEMBER_STATE_LABELS } from '../memberLabels';
import { directoryUrlFor, displayCode, renderQrCode } from '../memberCard';

type MemberCardProps = {
  loadProfile?: () => Promise<MemberProfile>;
  originOf?: () => string;
};

type Ready = { profile: MemberProfile; url: string; qr: string };

export function MemberCard({
  loadProfile = fetchOwnProfile,
  originOf = () => window.location.origin,
}: MemberCardProps) {
  const [ready, setReady] = useState<Ready | null>(null);
  const [profileOnly, setProfileOnly] = useState<MemberProfile | null>(null);
  const [failed, setFailed] = useState(false);

  const read = useCallback(async () => {
    const profile = await loadProfile();

    // No code means the chamber has not approved the registration, and there is
    // nothing to put in a card yet.
    if (profile.state !== MEMBER_STATES.ACTIVE || !profile.memberCode) {
      return { profile };
    }

    const url = directoryUrlFor(profile.memberCode, originOf());

    return { profile, url, qr: await renderQrCode(url) };
    // Read once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((result) => {
        if (!stillMounted) {
          return;
        }

        if ('qr' in result) {
          setReady(result as Ready);
        } else {
          setProfileOnly(result.profile);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setFailed(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar su carné. Recargue la página para intentarlo de nuevo.
      </p>
    );
  }

  // Nothing is shown until an administrator has approved the registration.
  if (profileOnly !== null) {
    const state = MEMBER_STATE_LABELS[profileOnly.state];

    return (
      <div className="flex max-w-md flex-col gap-2 rounded-panel border border-dashed border-border p-8 text-center">
        <p className="font-medium">Su carné todavía no existe</p>
        <p className="text-sm text-content-muted">{state.detail}</p>
        <p className="text-sm text-content-muted">
          Se genera cuando la Cámara aprueba su afiliación.
        </p>
      </div>
    );
  }

  if (ready === null) {
    return <p className="text-sm text-content-muted">Preparando su carné…</p>;
  }

  const { profile, url, qr } = ready;

  return (
    <div className="flex flex-col gap-6">
      <AffiliateCard
        businessName={profile.businessName}
        kind={`${MEMBER_TYPE_LABELS[profile.memberType]}${
          profile.sector === null ? '' : ` · ${profile.sector.name}`
        }`}
        memberCode={displayCode(profile.memberCode ?? '')}
        affiliatedSince={profile.createdAt}
        qr={qr}
      />

      <div className="flex max-w-md flex-col gap-2">
        <p className="text-sm text-content-muted">
          Quien escanee el código llega a su ficha pública en el directorio:
        </p>
        <a href={url} className="font-mono text-sm break-all text-brand underline">
          {url}
        </a>
      </div>
    </div>
  );
}
