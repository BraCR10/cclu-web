import { formatMemberCode } from '@/shared/format';
import { CheckCircleIcon, CrossCircleIcon } from '@/shared/components/icons';
import type { DecidedApplication } from '../api/applications';
import { IDENTIFICATION_TYPE_LABELS, MEMBER_TYPE_LABELS } from '@/shared/config/memberTypes';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function formatDecisionDate(isoDate: string): string {
  const moment = new Date(isoDate);

  return Number.isNaN(moment.getTime()) ? 'fecha desconocida' : dateFormatter.format(moment);
}

export function DecidedApplicationCard({ application }: { application: DecidedApplication }) {
  const approved = application.applicationStatus === 'approved';

  return (
    <article className="animate-panel-in flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-semibold tracking-tight">{application.businessName}</h3>
          <p className="truncate text-sm text-content-muted">{application.email}</p>
        </div>

        <span
          className={`flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium ${
            approved ? 'bg-support text-on-support' : 'bg-highlight text-on-highlight'
          }`}
        >
          {approved ? (
            <CheckCircleIcon className="size-4" />
          ) : (
            <CrossCircleIcon className="size-4" />
          )}
          {approved ? 'Aprobada' : 'Rechazada'}
        </span>
      </header>

      <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-content-muted">Decidida el</dt>
          <dd>{formatDecisionDate(application.reviewedAt)}</dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-content-muted">Por</dt>
          <dd className="truncate">{application.reviewedBy?.email ?? 'No registrado'}</dd>
        </div>

        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-content-muted">
            {approved
              ? 'Código de agremiado'
              : IDENTIFICATION_TYPE_LABELS[application.identificationType]}
          </dt>
          <dd className="font-mono tabular-nums">
            {approved && application.memberCode !== undefined
              ? formatMemberCode(application.memberCode)
              : application.identificationNumber}
          </dd>
        </div>
      </dl>

      {!approved && application.statusReason !== undefined && (
        <div className="flex flex-col gap-1 rounded-control bg-surface p-4">
          <p className="text-xs font-medium tracking-wide text-content-muted uppercase">
            Motivo del rechazo
          </p>
          <p className="text-sm">{application.statusReason}</p>
        </div>
      )}

      <p className="text-xs text-content-muted">
        {MEMBER_TYPE_LABELS[application.memberType]}
        {application.sector !== null && ` · ${application.sector.name}`}
      </p>
    </article>
  );
}
