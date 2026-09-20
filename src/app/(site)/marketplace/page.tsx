import { ComingSoon } from '@/shared/components/ComingSoon';
import { findSection } from '@/shared/config/siteNavigation';

const SECTION = findSection('/marketplace')!;

export const metadata = {
  title: `${SECTION.label} | Cámara de Comercio del Cantón de La Unión`,
};

export default function MarketplacePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <ComingSoon section={SECTION} />
    </main>
  );
}
