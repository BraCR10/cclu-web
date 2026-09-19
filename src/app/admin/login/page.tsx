'use client';

import { useRouter } from 'next/navigation';
import { AdminLoginForm } from '@/modules/admin/components/AdminLoginForm';

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-content-muted uppercase">
          Panel administrativo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-brand">Iniciar sesión</h1>
      </div>

      <AdminLoginForm onSignedIn={() => router.replace('/admin')} />
    </main>
  );
}
