'use client';

import { useCallback, useEffect, useState } from 'react';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { fetchOwnJobs, closeJob as closeJobApi, type Job } from '../api/jobs';
import { CONTRACT_TYPE_LABELS } from '../jobsRules';
import { PaidGateNotice } from '@/shared/components/PaidGateNotice';
import {
  fetchOwnMembership,
  MEMBERSHIP_TYPES,
  type Membership,
} from '@/modules/members/api/membership';
import { JobForm } from './JobForm';

type MyJobsPanelProps = {
  loadJobs?: () => Promise<Job[]>;
  loadMembership?: () => Promise<Membership>;
  removeJob?: (id: string) => Promise<void>;
};

export function MyJobsPanel({
  loadJobs = fetchOwnJobs,
  loadMembership = fetchOwnMembership,
  removeJob = closeJobApi,
}: MyJobsPanelProps) {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Job | 'new' | null>(null);
  const { toasts, show, dismiss } = useToasts();

  const refresh = useCallback(() => {
    loadJobs()
      .then(setJobs)
      .catch(() => setFailed(true));
  }, [loadJobs]);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadJobs(), loadMembership()])
      .then(([found, foundMembership]) => {
        if (stillMounted) {
          setJobs(found);
          setMembership(foundMembership);
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
  }, [loadJobs, loadMembership]);

  function handleSaved() {
    setEditing(null);
    refresh();
    show({ tone: 'success', title: 'La vacante quedó guardada' });
  }

  async function handleClose(job: Job) {
    try {
      await removeJob(job.id);
      refresh();
      show({ tone: 'success', title: 'La vacante fue cerrada' });
    } catch {
      show({ tone: 'problem', title: 'No se pudo cerrar la vacante' });
    }
  }

  if (editing !== null) {
    return (
      <JobForm
        job={editing === 'new' ? undefined : editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const isFree = membership !== null && membership.type === MEMBERSHIP_TYPES.FREE;

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      {isFree ? (
        <PaidGateNotice />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
          >
            Publicar vacante
          </button>
        </div>
      )}

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar sus vacantes.
        </p>
      )}

      {!failed && jobs === null && <p className="text-sm text-content-muted">Cargando…</p>}

      {!failed && jobs !== null && jobs.length === 0 && (
        <p className="text-sm text-content-muted">Todavía no ha publicado ninguna vacante.</p>
      )}

      {!failed && jobs !== null && jobs.length > 0 && (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center justify-between gap-4 rounded-panel border border-border bg-surface-raised p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{job.title}</span>
                <span className="text-xs text-content-muted">
                  {CONTRACT_TYPE_LABELS[job.contractType]} · {job.isActive ? 'Abierta' : 'Cerrada'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(job)}
                  className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                >
                  Editar
                </button>
                {job.isActive && (
                  <button
                    type="button"
                    onClick={() => handleClose(job)}
                    className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
