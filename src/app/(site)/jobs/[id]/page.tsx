'use client';

import { use } from 'react';
import { BackLink } from '@/shared/components/BackLink';
import { JobDetail } from '@/modules/jobs/components/JobDetail';

export default function JobEntryPage({ params }: PageProps<'/jobs/[id]'>) {
  const { id } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        <BackLink href="/jobs" label="Volver a la bolsa de empleo" />

        <JobDetail id={id} />
      </main>
    </div>
  );
}
