import Link from 'next/link';
import { MESSAGES } from '@/shared/config/messages';

// Shown wherever a free member would otherwise reach a publish action. The
// form behind it still handles the API's refusal; this just says it earlier.
export function PaidGateNotice() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-panel border border-dashed border-border bg-surface-raised p-6">
      <p className="text-sm">{MESSAGES.paid_membership_required}</p>
      <Link
        href="/member/membership"
        className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand"
      >
        Ir a Mi membresía
      </Link>
    </div>
  );
}
