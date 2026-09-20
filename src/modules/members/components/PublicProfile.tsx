'use client';

import { useCallback, useEffect, useState } from 'react';
import { MEMBER_TYPE_LABELS } from '@/modules/admin/applicationRules';
import { fetchPublicProfile, type PublicProfile as Profile } from '../api/directory';

type PublicProfileProps = {
  memberCode: string;
  loadProfile?: (memberCode: string) => Promise<Profile>;
};

const dateFormatter = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });

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
}: PublicProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missing, setMissing] = useState(false);

  const read = useCallback(() => loadProfile(memberCode), [loadProfile, memberCode]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setProfile(found);
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
    { label: 'Instagram', value: profile.instagram },
    { label: 'Facebook', value: profile.facebook },
    { label: 'LinkedIn', value: profile.linkedin },
  ].filter((handle) => handle.value !== null);

  return (
    <article className="animate-panel-in flex flex-col gap-8 rounded-panel border border-border bg-surface-raised p-6 sm:p-8">
      <header className="flex flex-col gap-3">
        <span className="w-fit rounded-pill bg-support px-3 py-1 text-xs font-medium text-on-support">
          Afiliado a la Cámara
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {profile.businessName}
        </h1>
        <p className="text-content-muted">
          {MEMBER_TYPE_LABELS[profile.memberType]}
          {profile.sector !== null && ` · ${profile.sector}`}
        </p>
      </header>

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
        <Detail label="Código de agremiado" value={profile.memberCode} />
        <Detail
          label="Afiliado desde"
          value={dateFormatter.format(new Date(profile.affiliatedSince))}
        />
      </dl>

      {(profile.website !== null || handles.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
          {profile.website !== null && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-pill border border-brand px-4 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-on-brand"
            >
              Sitio web
            </a>
          )}

          {/* Stored as free text, so they may be a handle rather than an address
              and must not be turned into one. */}
          {handles.map((handle) => (
            <span key={handle.label} className="rounded-pill bg-surface px-3 py-1.5 text-sm">
              <span className="text-content-muted">{handle.label}</span> {handle.value}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
