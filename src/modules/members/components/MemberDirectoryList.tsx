'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { fetchCantons, fetchSectors, type Canton, type Sector } from '../api/registration';
import { searchDirectory, type DirectoryPage, type DirectorySearch } from '../api/directory';
import { MemberDirectoryCard } from './MemberDirectoryCard';

type MemberDirectoryListProps = {
  loadCantons?: () => Promise<Canton[]>;
  loadSectors?: () => Promise<Sector[]>;
  search?: (params: DirectorySearch) => Promise<DirectoryPage>;
};

function readFilters(name: string, canton: string, sector: string, page: number): DirectorySearch {
  return {
    name: name.trim() === '' ? undefined : name.trim(),
    canton: canton === '' ? undefined : canton,
    sector: sector === '' ? undefined : sector,
    page,
  };
}

export function MemberDirectoryList({
  loadCantons = fetchCantons,
  loadSectors = fetchSectors,
  search = searchDirectory,
}: MemberDirectoryListProps) {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [name, setName] = useState('');
  const [canton, setCanton] = useState('');
  const [sector, setSector] = useState('');
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<DirectoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadCantons(), loadSectors()])
      .then(([cantonList, sectorList]) => {
        if (stillMounted) {
          setCantons(cantonList);
          setSectors(sectorList);
        }
      })
      .catch(() => {});

    return () => {
      stillMounted = false;
    };
  }, [loadCantons, loadSectors]);

  const run = useCallback(
    (filters: DirectorySearch) => {
      // Marking the search as loading is deferred to a microtask, so an effect
      // that triggers it starts the fetch without setting state during its own
      // synchronous body.
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

  // A page change alone re-runs the search with the filters already applied.
  // A filter change goes through the form instead, which also resets the page.
  useEffect(() => {
    run(readFilters(name, canton, sector, page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    run(readFilters(name, canton, sector, 1));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-panel border border-border bg-surface-raised p-6 sm:grid-cols-3"
      >
        <Field id="directory-name" label="Nombre">
          {(control) => (
            <input
              {...control}
              id="directory-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre del comercio"
              className={CONTROL_CLASS}
            />
          )}
        </Field>

        <Field id="directory-canton" label="Cantón">
          {(control) => (
            <select
              {...control}
              id="directory-canton"
              value={canton}
              onChange={(event) => setCanton(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Todos</option>
              {cantons.map((found) => (
                <option key={found._id} value={found._id}>
                  {found.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="directory-sector" label="Sector">
          {(control) => (
            <select
              {...control}
              id="directory-sector"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Todos</option>
              {sectors.map((found) => (
                <option key={found._id} value={found._id}>
                  {found.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="flex justify-end sm:col-span-3">
          <button
            type="submit"
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
          >
            Buscar
          </button>
        </div>
      </form>

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar el directorio. Intente de nuevo.
        </p>
      )}

      {!failed && loading && <p className="text-sm text-content-muted">Buscando…</p>}

      {!failed && !loading && answer !== null && answer.items.length === 0 && (
        <p className="text-sm text-content-muted">
          No se encontró ningún afiliado con esos filtros.
        </p>
      )}

      {!failed && answer !== null && answer.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {answer.items.map((entry) => (
              <MemberDirectoryCard key={entry.memberCode} entry={entry} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-content-muted">
            <span>
              {answer.total} {answer.total === 1 ? 'afiliado' : 'afiliados'}
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
