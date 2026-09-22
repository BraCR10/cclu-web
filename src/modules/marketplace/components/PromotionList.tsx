'use client';

import { useCallback, useEffect, useState } from 'react';
import { listPromotions, type PromotionPage, type PromotionSearch } from '../api/promotions';
import { SearchFilters, type SearchFilterValues } from './SearchFilters';
import { PromotionCard } from './PromotionCard';

type PromotionListProps = {
  search?: (params: PromotionSearch) => Promise<PromotionPage>;
};

export function PromotionList({ search = listPromotions }: PromotionListProps) {
  const [filters, setFilters] = useState<SearchFilterValues>({});
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<PromotionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const run = useCallback(
    (params: PromotionSearch) => {
      // Deferred to a microtask so an effect that triggers this never sets
      // state during its own synchronous body.
      Promise.resolve()
        .then(() => {
          setLoading(true);
          setFailed(false);

          return search(params);
        })
        .then((found) => setAnswer(found))
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    },
    [search],
  );

  useEffect(() => {
    run({ ...filters, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearch(next: SearchFilterValues) {
    setFilters(next);
    setPage(1);
    run({ ...next, page: 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchFilters
        idPrefix="promotions"
        namePlaceholder="Nombre de la promoción"
        onSearch={handleSearch}
      />

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar las promociones. Intente de nuevo.
        </p>
      )}

      {!failed && loading && <p className="text-sm text-content-muted">Buscando…</p>}

      {!failed && !loading && answer !== null && answer.items.length === 0 && (
        <p className="text-sm text-content-muted">
          No hay promociones vigentes con esos criterios.
        </p>
      )}

      {!failed && answer !== null && answer.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {answer.items.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-content-muted">
            <span>
              {answer.total} {answer.total === 1 ? 'promoción' : 'promociones'}
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
