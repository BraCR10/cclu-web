'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/shared/components/BrandMark';
import { MemberLoginForm } from '@/modules/members/components/MemberLoginForm';

export default function MemberLoginPage() {
  const router = useRouter();

  return (
    <div className="grid flex-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-wash-from to-wash-to p-12 text-on-wash lg:flex">
        {/* The sun of the mark, enlarged and bled off the corner. */}
        <div className="pointer-events-none absolute -top-28 -right-28 size-[26rem] rounded-full bg-highlight opacity-40 blur-[90px]" />

        <BrandMark size="lg" className="relative" />

        <div className="relative flex max-w-md flex-col gap-4">
          <p className="text-3xl font-semibold tracking-tight text-balance">
            El comercio de La Unión, en un solo lugar.
          </p>
          <p className="text-lg opacity-80">
            Directorio de afiliados, marketplace y bolsa de empleo.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <BrandMark size="sm" className="text-content lg:hidden" />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium tracking-wide text-content-muted uppercase">
              Agremiados
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-brand">Iniciar sesión</h1>
          </div>

          <MemberLoginForm onSignedIn={() => router.replace('/member')} />

          <p className="text-sm text-content-muted">
            ¿Todavía no está afiliado?{' '}
            <Link href="/register" className="font-medium text-brand underline">
              Envíe su solicitud
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
