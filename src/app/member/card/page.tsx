'use client';

import { PanelHeading } from '@/shared/components/PanelHeading';
import { MemberCard } from '@/modules/members/components/MemberCard';

export default function MemberCardPage() {
  return (
    <>
      <PanelHeading
        title="Mi carné"
        subtitle="Muéstrelo para acreditar su afiliación. Quien escanee el código llega a su ficha pública."
      />
      <MemberCard />
    </>
  );
}
