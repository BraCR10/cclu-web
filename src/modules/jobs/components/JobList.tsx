'use client';

import { useCallback, useEffect, useState } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { listJobs, type JobPage, type JobSearch } from '../api/jobs';
import { CONTRACT_TYPES, CONTRACT_TYPE_LABELS } from '../jobsRules';
import { JobCard } from './JobCard';

type JobListProps = {
  search?: (params: JobSearch) => Promise<JobPage>;
};

export function JobList({ search = listJobs }: JobListProps) {
  const [contractType, setContractType] = useState('');
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<JobPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const run = useCallback(
    (filters: JobSearch) => {
      // Deferred to a microtask so an effect that triggers this never sets
      // state during its own synchronous body.
      Promise.resolve()
        .then(() => {
          setLoading(true);
          setFailed(false);

          return search(filters);
        })
        .then((found) => setAnswer(found))
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    },
    [search],
  );

  useEffect(() => {
    run({
      page,
      contractType: contractType === '' ? undefined : (contractType as JobSearch['contractType']),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleFilterChange(value: string) {
    setContractType(value);
    setPage(1);
    run({ page: 1, contractType: value === '' ? undefined : (value as JobSearch['contractType']) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-xs">
        <Field id="job-contract-type" label="Jornada">
          {(control) => (
            <select
              {...control}
              id="job-contract-type"
              value={contractType}
              onChange={(event) => handleFilterChange(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Todas</option>
              {Object.values(CONTRACT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {CONTRACT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar las vacantes. Intente de nuevo.
        </p>
      )}

      {!failed && loading && <p className="text-sm text-content-muted">Buscando…</p>}

      {!failed && !loading && answer !== null && answer.items.length === 0 && (
        <p className="text-sm text-content-muted">No hay vacantes publicadas con ese filtro.</p>
      )}

      {!failed && answer !== null && answer.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {answer.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-content-muted">
            <span>
              {answer.total} {answer.total === 1 ? 'vacante' : 'vacantes'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-control border border-border px-4 py-2 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!answer.hasMore}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-control border border-border px-4 py-2 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
