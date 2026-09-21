'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/shared/components/BrandMark';
import { BackLink } from '@/shared/components/BackLink';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { AdminInvitationForm } from '@/modules/admin/components/AdminInvitationForm';

export default function AdminInvitationPage({ params }: PageProps<'/admin/invitation/[token]'>) {
  const { token } = use(params);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href="/" className="w-fit">
          <BrandMark size="sm" />
        </Link>

        <BackLink href="/" label="Volver al inicio" />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-content-muted uppercase">
            Panel administrativo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-brand">Aceptar invitación</h1>
        </div>

        <AdminInvitationForm invitationId={token} />
      </div>
    </main>
  );
}
