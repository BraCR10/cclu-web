'use client';

import { use } from 'react';
import { PublicProfile } from '@/modules/members/components/PublicProfile';

export default function DirectoryEntryPage({ params }: PageProps<'/directory/[memberCode]'>) {
  const { memberCode } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <PublicProfile memberCode={memberCode} />
      </main>
    </div>
  );
}
