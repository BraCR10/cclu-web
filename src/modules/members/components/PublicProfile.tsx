'use client';

import { useCallback, useEffect, useState } from 'react';
import { MEMBER_TYPE_LABELS } from '@/shared/config/memberTypes';
import { contactIcon } from '@/shared/components/contactFields';
import { AffiliateCard } from '@/shared/components/AffiliateCard';
import { GlobeIcon } from '@/shared/components/icons';
import { fetchPublicProfile, type PublicProfile as Profile } from '../api/directory';
import { directoryUrlFor, displayCode, renderQrCode } from '../memberCard';

type PublicProfileProps = {
  memberCode: string;
  loadProfile?: (memberCode: string) => Promise<Profile>;
  originOf?: () => string;
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-l border-border pl-3">
      <dt className="text-[0.6875rem] font-medium tracking-widest text-content-muted uppercase">
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function PublicProfile({
  memberCode,
  loadProfile = fetchPublicProfile,
  originOf = () => window.location.origin,
}: PublicProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qr, setQr] = useState<string | undefined>(undefined);
  const [missing, setMissing] = useState(false);

  const read = useCallback(async () => {
    const found = await loadProfile(memberCode);

    // The same code the card carries, drawn again here so it can be shown to
    // somebody else's camera rather than only read off the screen.
    return { found, qr: await renderQrCode(directoryUrlFor(found.memberCode, originOf())) };
    // Read once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberCode]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then(({ found, qr: drawn }) => {
        if (stillMounted) {
          setProfile(found);
          setQr(drawn);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setMissing(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  if (missing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-border p-12 text-center">
        <p className="font-medium">Ese código no corresponde a un afiliado</p>
        <p className="max-w-sm text-sm text-content-muted">
          Verifique que lo escribió completo. Si está seguro, la afiliación puede no estar vigente.
        </p>
      </div>
    );
  }

  if (profile === null) {
    return <p className="text-sm text-content-muted">Cargando la ficha…</p>;
  }

  const handles = [
    { field: 'instagram', label: 'Instagram', value: profile.instagram },
    { field: 'facebook', label: 'Facebook', value: profile.facebook },
    { field: 'linkedin', label: 'LinkedIn', value: profile.linkedin },
  ].filter((handle) => handle.value !== null);

  const kind = `${MEMBER_TYPE_LABELS[profile.memberType]}${
    profile.sector === null ? '' : ` · ${profile.sector}`
  }`;

  return (
    <div className="flex flex-col gap-8">
      <AffiliateCard
        businessName={profile.businessName}
        kind={kind}
        memberCode={displayCode(profile.memberCode)}
        affiliatedSince={profile.affiliatedSince}
        qr={qr}
        headingLevel="h1"
      />

      <article className="animate-panel-in flex flex-col gap-8 rounded-panel border border-border bg-surface-raised p-6 sm:p-8">
        <p className="border-l-2 border-border pl-4 leading-relaxed text-content-muted">
          {profile.businessDescription}
        </p>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Teléfono" value={profile.phone} />
          {profile.whatsappNumber !== null && (
            <Detail label="WhatsApp" value={profile.whatsappNumber} />
          )}
          <Detail
            label="Cantón"
            value={
              profile.canton === null
                ? 'Sin cantón'
                : `${profile.canton}${profile.province === null ? '' : `, ${profile.province}`}`
            }
          />
          <Detail label="Ubicación" value={profile.location} />
        </dl>

        {(profile.website !== null || handles.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
            {profile.website !== null && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-pill border border-brand px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-on-brand"
              >
                <GlobeIcon className="size-4" />
                Sitio web
              </a>
            )}

            {/* Stored as free text, so they may be a handle rather than an address
              and must not be turned into one. */}
            {handles.map((handle) => (
              <span
                key={handle.field}
                title={handle.label}
                className="flex items-center gap-2 rounded-pill bg-surface px-3 py-1.5 text-sm"
              >
                <span className="text-content-muted">{contactIcon(handle.field)}</span>
                {handle.value}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
