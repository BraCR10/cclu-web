'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { AdminProfile } from '@/modules/admin/components/AdminProfile';

export default function AdminProfilePage() {
  return (
    <>
      <PanelHeading title="Mi perfil" subtitle="Su cuenta de administrador y su contraseña." />
      <AdminProfile />
    </>
  );
}
