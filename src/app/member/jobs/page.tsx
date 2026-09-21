'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MyJobsPanel } from '@/modules/jobs/components/MyJobsPanel';

export default function MemberJobsPage() {
  return (
    <>
      <PanelHeading
        title="Mis vacantes"
        subtitle="Publique y administre las ofertas de empleo de su negocio."
      />
      <MyJobsPanel />
    </>
  );
}
