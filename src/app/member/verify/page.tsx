'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { CodeVerifier } from '@/modules/members/components/CodeVerifier';

export default function VerifyMemberCodePage() {
  return (
    <>
      <PanelHeading
        title="Verificar código"
        subtitle="Confirme que un código pertenece a un afiliado antes de aplicarle un descuento."
      />
      <CodeVerifier />
    </>
  );
}
