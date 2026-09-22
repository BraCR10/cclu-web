'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJob, type Job } from '../api/jobs';
import { CONTRACT_TYPE_LABELS } from '../jobsRules';

type JobDetailProps = {
  id: string;
  loadJob?: (id: string) => Promise<Job>;
};

export function JobDetail({ id, loadJob = fetchJob }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [missing, setMissing] = useState(false);

  const read = useCallback(() => loadJob(id), [loadJob, id]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setJob(found);
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
        <p className="font-medium">Esta vacante ya no está disponible</p>
        <p className="max-w-sm text-sm text-content-muted">
          Puede que haya sido cerrada por quien la publicó.
        </p>
        <Link href="/jobs" className="text-sm font-medium text-brand">
          Volver a la bolsa de empleo
        </Link>
      </div>
    );
  }

  if (job === null) {
    return <p className="text-sm text-content-muted">Cargando la vacante…</p>;
  }

  return (
    <article className="animate-panel-in flex flex-col gap-6 rounded-panel border border-border bg-surface-raised p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">{job.title}</h1>
        {job.business !== null && (
          <p className="text-sm text-content-muted">{job.business.businessName}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium">
          {CONTRACT_TYPE_LABELS[job.contractType]}
        </span>
        {job.location !== null && (
          <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium">
            {job.location}
          </span>
        )}
      </div>

      <p className="border-l-2 border-border pl-4 leading-relaxed whitespace-pre-line text-content-muted">
        {job.description}
      </p>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Requisitos</span>
        <p className="whitespace-pre-line text-content-muted">{job.requirements}</p>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Cómo aplicar</span>
        <p className="whitespace-pre-line text-content-muted">{job.howToApply}</p>
      </div>

      {(job.contactEmail !== null || job.contactPhone !== null) && (
        <div className="flex flex-col gap-1 border-t border-border pt-6 text-sm">
          <span className="font-medium">Contacto</span>
          {job.contactEmail !== null && <span>{job.contactEmail}</span>}
          {job.contactPhone !== null && <span>{job.contactPhone}</span>}
        </div>
      )}
    </article>
  );
}
