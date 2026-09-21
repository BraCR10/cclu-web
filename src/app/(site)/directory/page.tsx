import { MemberDirectoryList } from '@/modules/members/components/MemberDirectoryList';
import { MemberLookup } from '@/modules/members/components/MemberLookup';
import { findSection } from '@/shared/config/siteNavigation';

const SECTION = findSection('/directory')!;

export const metadata = {
  title: `${SECTION.label} | Cámara de Comercio del Cantón de La Unión`,
};

export default function DirectoryPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{SECTION.label}</h1>
        <p className="text-content-muted">{SECTION.summary}</p>
      </div>

      <MemberDirectoryList />

      <MemberLookup />
    </main>
  );
}
