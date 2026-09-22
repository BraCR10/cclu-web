import Link from 'next/link';
import type { Promotion } from '../api/promotions';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type PromotionCardProps = { promotion: Promotion };

export function PromotionCard({ promotion }: PromotionCardProps) {
  return (
    <Link
      href={`/marketplace/promotions/${promotion.id}`}
      className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-5 transition-colors hover:border-brand"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold tracking-tight">{promotion.title}</h3>
        {promotion.business !== null && (
          <p className="text-sm text-content-muted">{promotion.business.businessName}</p>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-content-muted">{promotion.description}</p>

      <span className="w-fit rounded-pill bg-surface px-2.5 py-0.5 text-xs font-medium text-content-muted">
        Vigente hasta el {dateFormatter.format(new Date(promotion.validUntil))}
      </span>
    </Link>
  );
}
