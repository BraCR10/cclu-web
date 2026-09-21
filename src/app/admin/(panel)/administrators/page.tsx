'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { AdministratorsPanel } from '@/modules/admin/components/AdministratorsPanel';

export default function AdminAdministratorsPage() {
  return (
    <>
      <PanelHeading
        title="Administradores"
        subtitle="Invite administradores y administre sus datos y su estado."
      />
      <AdministratorsPanel />
    </>
  );
}
