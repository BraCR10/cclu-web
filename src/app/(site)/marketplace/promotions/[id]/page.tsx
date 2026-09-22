'use client';

import { use } from 'react';
import { BackLink } from '@/shared/components/BackLink';
import { PromotionDetail } from '@/modules/marketplace/components/PromotionDetail';

export default function PromotionEntryPage({ params }: PageProps<'/marketplace/promotions/[id]'>) {
  const { id } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <BackLink href="/marketplace" label="Volver al marketplace" />

        <PromotionDetail id={id} />
      </main>
    </div>
  );
}
