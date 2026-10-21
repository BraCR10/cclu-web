import { SubscriptionSection } from '@/modules/marketplace/components/SubscriptionSection';
import { UnderConstruction } from '@/shared/components/UnderConstruction';

// The rest of the home page waits on the sections it shows; the subscription
// form is the part it inserts that already works.
export default function Home() {
  return (
    <div className="flex w-full flex-col gap-8 py-6 lg:py-12">
      <UnderConstruction />
      <SubscriptionSection />
    </div>
  );
}
