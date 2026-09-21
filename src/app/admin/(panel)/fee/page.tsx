'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { FeePanel } from '@/modules/admin/components/FeePanel';

export default function AdminFeePage() {
  return (
    <>
      <PanelHeading
        title="Cuota mensual"
        subtitle="Defina el monto que pagan los agremiados con membresía paga."
      />
      <FeePanel />
    </>
  );
}
