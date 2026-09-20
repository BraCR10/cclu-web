'use client';

import { use } from 'react';
import { BackLink } from '@/shared/components/BackLink';
import { PublicProfile } from '@/modules/members/components/PublicProfile';

export default function DirectoryEntryPage({ params }: PageProps<'/directory/[memberCode]'>) {
  const { memberCode } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        {/* Most people arrive here from a scanned code, with no history behind
            them and nothing in the page pointing at the rest of the site. */}
        <BackLink href="/directory" label="Volver al directorio" />

        <PublicProfile memberCode={memberCode} />
      </main>
    </div>
  );
}
