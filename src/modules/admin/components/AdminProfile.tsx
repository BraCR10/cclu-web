'use client';

import { useSession } from '@/shared/auth/useSession';
import { PasswordSection } from '@/shared/components/PasswordSection';

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium tracking-widest text-content-muted uppercase">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

// An administrator is a post at the chamber rather than a business, so there is
// no form here: everything the account holds is decided by whoever created it.
export function AdminProfile() {
  const session = useSession();

  if (session.status !== 'authenticated') {
    return <p className="text-sm text-content-muted">Cargando su cuenta…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Su cuenta</h2>
          <p className="text-sm text-content-muted">
            Estos datos los fija la Cámara al crear la cuenta y no se editan desde aquí.
          </p>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <Detail label="Correo" value={session.identity.email} />
          <Detail label="Rol" value="Administrador" />
        </dl>
      </section>

      <PasswordSection />
    </div>
  );
}
