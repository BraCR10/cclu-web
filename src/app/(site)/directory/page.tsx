import { ComingSoon } from '@/shared/components/ComingSoon';
import { MemberLookup } from '@/modules/members/components/MemberLookup';
import { findSection } from '@/shared/config/siteNavigation';

const SECTION = findSection('/directory')!;

export const metadata = {
  title: `${SECTION.label} | Cámara de Comercio del Cantón de La Unión`,
};

export default function DirectoryPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <ComingSoon section={SECTION}>
        <MemberLookup />
      </ComingSoon>
    </main>
  );
}
