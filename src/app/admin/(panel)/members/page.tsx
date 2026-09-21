'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MembersPanel } from '@/modules/admin/components/MembersPanel';

export default function AdminMembersPage() {
  return (
    <>
      <PanelHeading
        title="Agremiados"
        subtitle="Busque agremiados, cambie el estado de su cuenta y administre su membresía."
      />
      <MembersPanel />
    </>
  );
}
