import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import type { BannerAllowance as Allowance } from '../api/plans';

// The banner itself is set up from the store settings. Here the member only
// learns what their plan allows.
const STORE_HREF = '/member/profile';

export function BannerAllowance({ allowance }: { allowance: Allowance }) {
  const translate = useTranslations('member.membership.banner');
  const isIncluded = allowance !== 'none';

  return (
    <Card as="section" aria-labelledby="banner-allowance" className="flex flex-col gap-4">
      <h2 id="banner-allowance" className="text-heading-s text-fg">
        {translate('title')}
      </h2>
      <div
        aria-hidden
        className="flex h-24 items-center justify-center rounded-md bg-surface-subtle text-fg-muted"
      >
        <ImageIcon className="size-6" />
      </div>
      <p className="text-label-m text-fg">{translate(allowance)}</p>
      {isIncluded ? (
        <Link
          href={STORE_HREF}
          className="self-start text-label-m text-fg-link underline-offset-4 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
        >
          {translate('change')}
        </Link>
      ) : (
        <p className="text-body-s text-fg-secondary">{translate('noneHint')}</p>
      )}
    </Card>
  );
}
