'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  listDiscounts,
  type Discount,
  type DiscountPage,
  type DiscountSearch,
} from '../api/discounts';
import { SearchFilters, type SearchFilterValues } from './SearchFilters';
import { BusinessContact } from './BusinessContact';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type DiscountCatalogProps = {
  search?: (params: DiscountSearch) => Promise<DiscountPage>;
};

function DiscountEntry({ discount }: { discount: Discount }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          {discount.business !== null && (
            <span className="text-sm font-semibold tracking-tight">
              {discount.business.businessName}
            </span>
          )}
          <p className={`text-sm text-content-muted ${open ? '' : 'line-clamp-2'}`}>
            {discount.description}
          </p>
        </div>

        <span className="shrink-0 rounded-pill bg-surface px-2.5 py-0.5 text-xs font-medium text-content-muted">
          Vigente hasta el {dateFormatter.format(new Date(discount.validUntil))}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-fit text-xs font-medium text-brand"
      >
        {open ? 'Ver menos' : 'Ver condiciones y contacto'}
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Condiciones</span>
            <p className="whitespace-pre-line text-content-muted">{discount.conditions}</p>
          </div>

          {discount.business !== null && <BusinessContact business={discount.business} />}
        </div>
      )}
    </li>
  );
}

export function DiscountCatalog({ search = listDiscounts }: DiscountCatalogProps) {
  const [filters, setFilters] = useState<SearchFilterValues>({});
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<DiscountPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const run = useCallback(
    (params: DiscountSearch) => {
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
        idPrefix="discounts"
        namePlaceholder="Qué ofrece el descuento"
        onSearch={handleSearch}
      />

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar los descuentos. Intente de nuevo.
        </p>
      )}

      {!failed && loading && <p className="text-sm text-content-muted">Buscando…</p>}

      {!failed && !loading && answer !== null && answer.items.length === 0 && (
        <p className="text-sm text-content-muted">No hay descuentos vigentes con esos criterios.</p>
      )}

      {!failed && answer !== null && answer.items.length > 0 && (
        <>
          <ul className="flex flex-col gap-4">
            {answer.items.map((discount) => (
              <DiscountEntry key={discount.id} discount={discount} />
            ))}
          </ul>

          <div className="flex items-center justify-between text-sm text-content-muted">
            <span>
              {answer.total} {answer.total === 1 ? 'descuento' : 'descuentos'}
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
