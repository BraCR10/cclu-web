'use client';

import { use } from 'react';
import { NewPasswordForm } from '@/shared/components/NewPasswordForm';

export default function ResetPasswordPage({ params }: PageProps<'/password/reset/[token]'>) {
  const { token } = use(params);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Establecer una contraseña nueva</h1>
        <p className="max-w-prose text-content-muted">
          No necesita la anterior: el enlace que abrió es la prueba de que la cuenta es suya.
        </p>
      </div>

      <NewPasswordForm token={token} />
    </main>
  );
}
