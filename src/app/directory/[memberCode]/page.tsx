'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/shared/components/BrandMark';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { PublicProfile } from '@/modules/members/components/PublicProfile';

export default function DirectoryEntryPage({ params }: PageProps<'/directory/[memberCode]'>) {
  const { memberCode } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <Link href="/">
          <BrandMark size="sm" compact className="text-content" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <PublicProfile memberCode={memberCode} />
      </main>
    </div>
  );
}
