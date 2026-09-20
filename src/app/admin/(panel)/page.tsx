'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { ApplicationInbox } from '@/modules/admin/components/ApplicationInbox';

export default function AdminApplicationsPage() {
  return (
    <>
      <PanelHeading
        title="Solicitudes de afiliación"
        subtitle="Revise cada solicitud y decida. La más antigua aparece primero."
      />
      <ApplicationInbox />
    </>
  );
}
