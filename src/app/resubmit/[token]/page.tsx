'use client';

import { use } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/shared/components/BrandMark';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { ResubmissionForm } from '@/modules/members/components/ResubmissionForm';

export default function ResubmitPage({ params }: PageProps<'/resubmit/[token]'>) {
  const { token } = use(params);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <Link href="/">
          <BrandMark size="sm" compact className="text-content" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-brand">
            Volver a enviar su solicitud
          </h1>
          <p className="text-content-muted">
            Corrija lo que la Cámara le indicó y vuelva a enviarla con el mismo correo.
          </p>
        </div>

        <ResubmissionForm token={token} />
      </main>
    </div>
  );
}
