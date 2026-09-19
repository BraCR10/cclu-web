'use client';

import { useState, type FormEvent } from 'react';
import { describeWaitLength } from '@/shared/format/relativeTime';
import type { PendingApplication } from '../api/applications';
import { IDENTIFICATION_TYPE_LABELS, MEMBER_TYPE_LABELS } from '../applicationLabels';
import { WAITING_TONE_CLASS, waitingTone } from '../waitingTime';

type ApplicationCardProps = {
  application: PendingApplication;
  position: number;
  onApprove: () => void;
  onReject: (reason: string) => void;
  busy: boolean;
};

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-l border-border pl-3">
      <dt className="text-[0.6875rem] font-medium tracking-widest text-content-muted uppercase">
        {label}
      </dt>
      <dd className={`text-sm ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}

// Kept apart from the linked fields: the API stores these as free text, so they
// may be a handle rather than an address and must not be turned into one.
function Handle({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-pill bg-surface px-3 py-1 text-xs">
      <span className="text-content-muted">{label}</span> {value}
    </span>
  );
}

function Monogram({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-panel bg-linear-to-br from-brand to-support text-xl font-semibold text-on-brand"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function ApplicationCard({
  application,
  position,
  onApprove,
  onReject,
  busy,
}: ApplicationCardProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const reasonId = `reason-${application._id}`;
  const trimmedReason = reason.trim();
  const hasLinks = Boolean(
    application.website ||
    application.logoUrl ||
    application.instagram ||
    application.facebook ||
    application.linkedin,
  );

  return (
    <article className="group relative overflow-hidden rounded-panel border border-border bg-surface-raised transition-all duration-300 hover:border-brand hover:shadow-xl">
      {/* A seam of brand colour that fills in on hover, so the card being read
          separates itself from the stack. */}
      <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-linear-to-b from-brand to-support transition-transform duration-300 group-hover:scale-y-100" />

      <div className="flex flex-col gap-6 p-6 pl-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Monogram name={application.businessName} />

            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tabular-nums text-content-muted">
                  #{position}
                </span>
                <h3 className="text-xl font-semibold tracking-tight">{application.businessName}</h3>
              </div>
              <p className="truncate text-sm text-content-muted">{application.email}</p>
              <span className="w-fit rounded-pill bg-surface px-2.5 py-0.5 text-xs font-medium text-content-muted">
                {MEMBER_TYPE_LABELS[application.memberType]}
              </span>
            </div>
          </div>

          <time
            dateTime={application.createdAt}
            className={`rounded-pill px-3 py-1 text-xs font-medium ${WAITING_TONE_CLASS[waitingTone(application.createdAt)]}`}
          >
            Esperando {describeWaitLength(application.createdAt)}
          </time>
        </header>

        <p className="border-l-2 border-border pl-4 text-sm leading-relaxed text-content-muted">
          {application.businessDescription}
        </p>

        <dl className="grid gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label={IDENTIFICATION_TYPE_LABELS[application.identificationType]}
            value={application.identificationNumber}
            mono
          />
          <Detail label="Teléfono" value={application.phone} mono />
          <Detail label="Sector" value={application.sector?.name ?? 'Sin sector'} />
          <Detail
            label="Cantón"
            value={
              application.canton
                ? `${application.canton.name}, ${application.canton.province}`
                : 'Sin cantón'
            }
          />
          <Detail label="Ubicación" value={application.location} />
          {application.whatsappNumber && (
            <Detail label="WhatsApp" value={application.whatsappNumber} mono />
          )}
        </dl>

        {hasLinks && (
          <div className="flex flex-wrap items-center gap-2">
            {application.website && (
              <a
                href={application.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill border border-brand px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-on-brand"
              >
                Sitio web
              </a>
            )}
            {application.logoUrl && (
              <a
                href={application.logoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill border border-brand px-3 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-on-brand"
              >
                Logotipo
              </a>
            )}
            {application.instagram && <Handle label="Instagram" value={application.instagram} />}
            {application.facebook && <Handle label="Facebook" value={application.facebook} />}
            {application.linkedin && <Handle label="LinkedIn" value={application.linkedin} />}
          </div>
        )}

        {rejecting ? (
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              if (trimmedReason !== '') {
                onReject(trimmedReason);
              }
            }}
            className="flex flex-col gap-3 rounded-panel bg-surface p-4"
          >
            <label htmlFor={reasonId} className="text-sm font-medium">
              Motivo del rechazo
            </label>
            <p className="text-sm text-content-muted">
              El rechazo es permanente y el solicitante recibe este texto. Explique qué encontró.
            </p>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={500}
              required
              className="resize-y rounded-control border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs tabular-nums text-content-muted">
                {trimmedReason.length} de 500
              </span>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  disabled={busy}
                  className="rounded-control px-4 py-2 text-sm font-medium text-content-muted disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy || trimmedReason === ''}
                  className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-50"
                >
                  {busy ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={busy}
              className="rounded-control px-4 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="rounded-control bg-support px-5 py-2 text-sm font-medium text-on-support transition-opacity disabled:opacity-50"
            >
              {busy ? 'Aprobando…' : 'Aprobar'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
