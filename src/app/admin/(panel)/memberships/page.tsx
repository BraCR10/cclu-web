'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MembershipsPanel } from '@/modules/admin/components/MembershipsPanel';

export default function AdminMembershipsPage() {
  return (
    <>
      <PanelHeading
        title="Membresías"
        subtitle="Consulte el estado de las membresías y el historial de pagos de cada agremiado."
      />
      <MembershipsPanel />
    </>
  );
}
