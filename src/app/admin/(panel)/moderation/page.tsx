'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { ModerationPanel } from '@/modules/admin/components/ModerationPanel';

export default function AdminModerationPage() {
  return (
    <>
      <PanelHeading
        title="Moderación de contenido"
        subtitle="Inactive, reactive o bloquee lo publicado en el Marketplace y la Bolsa de Empleo."
      />
      <ModerationPanel />
    </>
  );
}
