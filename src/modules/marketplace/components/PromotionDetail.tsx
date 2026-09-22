'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPromotion, type Promotion } from '../api/promotions';
import { BusinessContact } from './BusinessContact';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type PromotionDetailProps = {
  id: string;
  loadPromotion?: (id: string) => Promise<Promotion>;
};

export function PromotionDetail({ id, loadPromotion = fetchPromotion }: PromotionDetailProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [missing, setMissing] = useState(false);

  const read = useCallback(() => loadPromotion(id), [loadPromotion, id]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setPromotion(found);
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
        <p className="font-medium">Esta promoción ya no está disponible</p>
        <p className="max-w-sm text-sm text-content-muted">
          Puede que haya vencido o que el comercio la haya retirado.
        </p>
        <Link href="/marketplace" className="text-sm font-medium text-brand">
          Volver al marketplace
        </Link>
      </div>
    );
  }

  if (promotion === null) {
    return <p className="text-sm text-content-muted">Cargando la promoción…</p>;
  }

  return (
    <article className="animate-panel-in flex flex-col gap-6 rounded-panel border border-border bg-surface-raised p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">{promotion.title}</h1>
        <span className="text-sm text-content-muted">
          Vigente hasta el {dateFormatter.format(new Date(promotion.validUntil))}
        </span>
      </div>

      <p className="border-l-2 border-border pl-4 leading-relaxed whitespace-pre-line text-content-muted">
        {promotion.description}
      </p>

      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Condiciones</span>
        <p className="whitespace-pre-line text-content-muted">{promotion.conditions}</p>
      </div>

      {promotion.business !== null && <BusinessContact business={promotion.business} />}
    </article>
  );
}
