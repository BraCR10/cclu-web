'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { ReportsPanel } from '@/modules/admin/components/ReportsPanel';

export default function AdminReportsPage() {
  return (
    <>
      <PanelHeading
        title="Reportes"
        subtitle="Genere listados de agremiados y publicaciones, filtrados por cantón y sector."
      />
      <ReportsPanel />
    </>
  );
}
