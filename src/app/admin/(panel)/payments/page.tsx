'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { PendingPaymentsPanel } from '@/modules/admin/components/PendingPaymentsPanel';

export default function AdminPaymentsPage() {
  return (
    <>
      <PanelHeading
        title="Pagos pendientes"
        subtitle="Revise cada comprobante y decida. El más antiguo aparece primero."
      />
      <PendingPaymentsPanel />
    </>
  );
}
