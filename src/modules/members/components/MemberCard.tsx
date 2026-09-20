'use client';

import { useCallback, useEffect, useState } from 'react';
import { BrandMark } from '@/shared/components/BrandMark';
import { MEMBER_TYPE_LABELS } from '@/modules/admin/applicationRules';
import { fetchOwnProfile, MEMBER_STATES, type MemberProfile } from '../api/profile';
import { MEMBER_STATE_LABELS } from '../memberLabels';
import { directoryUrlFor, displayCode, renderQrCode } from '../memberCard';

type MemberCardProps = {
  loadProfile?: () => Promise<MemberProfile>;
  originOf?: () => string;
};

type Ready = { profile: MemberProfile; url: string; qr: string };

const dateFormatter = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });

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
      <article className="animate-panel-in w-full max-w-md overflow-hidden rounded-panel border border-border bg-surface-raised shadow-xl">
        <header className="relative overflow-hidden bg-linear-to-br from-wash-from to-wash-to px-6 py-5 text-on-wash">
          <div className="pointer-events-none absolute -top-16 -right-12 size-44 rounded-full bg-highlight opacity-30 blur-3xl" />
          <BrandMark size="sm" compact className="relative" />
        </header>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance">
              {profile.businessName}
            </h2>
            <p className="text-sm text-content-muted">
              {MEMBER_TYPE_LABELS[profile.memberType]}
              {profile.sector !== null && ` · ${profile.sector.name}`}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* The library builds this from an address this application made, so
                no text a person typed reaches the markup. */}
            <div
              aria-hidden
              className="size-32 shrink-0 rounded-control bg-white p-2 [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />

            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-xs font-medium tracking-widest text-content-muted uppercase">
                Código de agremiado
              </span>
              <span className="font-mono text-2xl font-semibold tracking-wider tabular-nums">
                {displayCode(profile.memberCode ?? '')}
              </span>
              <span className="rounded-pill bg-support px-2.5 py-0.5 text-xs font-medium text-on-support w-fit">
                Afiliación activa
              </span>
            </div>
          </div>

          <p className="border-t border-border pt-4 text-xs text-content-muted">
            Afiliado desde {dateFormatter.format(new Date(profile.createdAt))}
          </p>
        </div>
      </article>

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
