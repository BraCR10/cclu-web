'use client';

import { use } from 'react';
import { BackLink } from '@/shared/components/BackLink';
import { ListingDetail } from '@/modules/marketplace/components/ListingDetail';

export default function MarketplaceEntryPage({ params }: PageProps<'/marketplace/[id]'>) {
  const { id } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <BackLink href="/marketplace" label="Volver al marketplace" />

        <ListingDetail id={id} />
      </main>
    </div>
  );
}
