import Link from 'next/link';
import { ArrowRightIcon, CheckCircleIcon } from '@/shared/components/icons';
import { BackLink } from '@/shared/components/BackLink';

export const metadata = {
  title: 'Solicitud enviada',
};

// A screen of its own rather than a panel where the form used to be. On its own
// address it survives a refresh, it can be returned to, and it leaves the
// registration route free for somebody starting a new one.
export default function RegistrationSentPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-20">
      <div className="flex flex-col gap-4">
        <CheckCircleIcon className="size-10 text-support" />

        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Su solicitud quedó enviada
        </h1>

        <p className="max-w-prose text-lg text-content-muted">
          La Cámara la revisará y le escribirá al correo que indicó, la acepte o no. No hace falta
          que envíe nada más.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <h2 className="text-lg font-semibold tracking-tight">Qué sigue</h2>

        <ol className="flex flex-col gap-3 text-content-muted">
          <li className="flex items-start gap-3">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-support" />
            La Cámara revisa los datos de su comercio o actividad profesional.
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-support" />
            Si la acepta, recibirá su código de agremiado y podrá entrar con el correo y la
            contraseña que acaba de registrar.
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-support" />
            Si no, el correo le indicará el motivo y un enlace para corregir y volver a enviarla.
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-control bg-brand px-5 py-3 font-medium text-on-brand"
        >
          Volver al inicio
          <ArrowRightIcon className="size-4" />
        </Link>

        <BackLink href="/directory" label="Ver el directorio" />
      </div>
    </main>
  );
}
