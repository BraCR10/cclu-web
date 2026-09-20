import Link from 'next/link';
import { ArrowRightIcon, BadgeCheckIcon, IdCardIcon, InboxIcon } from '@/shared/components/icons';
import {
  JOIN_ENTRY,
  SECTION_STATUS,
  SECTION_STATUS_LABELS,
  SIGN_IN_ENTRIES,
  SITE_SECTIONS,
} from '@/shared/config/siteNavigation';

// The three steps between asking to join and holding a card. Shown because the
// wait between them is the part people write to the chamber about.
const JOINING_STEPS = [
  {
    title: 'Envíe su solicitud',
    detail: 'Complete los datos de su comercio o de su actividad profesional.',
    Icon: InboxIcon,
  },
  {
    title: 'La Cámara la revisa',
    detail: 'Le escribiremos al correo que indicó, la acepte o no.',
    Icon: BadgeCheckIcon,
  },
  {
    title: 'Reciba su carné',
    detail: 'Con su código de agremiado y un QR que lleva a su ficha pública.',
    Icon: IdCardIcon,
  },
];

const STATUS_TONE: Record<string, string> = {
  [SECTION_STATUS.AVAILABLE]: 'bg-support text-on-support',
  [SECTION_STATUS.PARTIAL]: 'bg-highlight text-on-highlight',
  [SECTION_STATUS.PLANNED]: 'border border-border text-content-muted',
};

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-wash-from to-wash-to text-on-wash">
        {/* The sun of the mark, enlarged and bled off the corner. */}
        <div className="pointer-events-none absolute -top-36 -right-20 size-[30rem] rounded-full bg-highlight opacity-40 blur-[100px]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 sm:py-28">
          <div className="flex max-w-2xl flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              El comercio de La Unión, en un solo lugar.
            </h1>
            <p className="text-lg opacity-80 sm:text-xl">
              Directorio de comercios afiliados, marketplace y bolsa de empleo de la Cámara de
              Comercio, Turismo, Industria y Afines del Cantón de La Unión.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={JOIN_ENTRY.href}
              className="flex items-center gap-2 rounded-control bg-highlight px-5 py-3 font-medium text-on-highlight"
            >
              {JOIN_ENTRY.label}
              <ArrowRightIcon className="size-4" />
            </Link>

            {SIGN_IN_ENTRIES.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="rounded-control border border-current/30 px-5 py-3 font-medium transition-colors hover:bg-white/10"
              >
                {entry.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <ul className="grid gap-4 sm:grid-cols-3">
          {SITE_SECTIONS.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="flex h-full flex-col gap-3 rounded-panel border border-border bg-surface-raised p-6 transition-colors hover:border-brand"
              >
                <span
                  className={`w-fit rounded-pill px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[section.status]}`}
                >
                  {SECTION_STATUS_LABELS[section.status]}
                </span>
                <h2 className="text-lg font-semibold tracking-tight">{section.label}</h2>
                <p className="text-content-muted">{section.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cómo afiliarse</h2>
            <p className="max-w-prose text-content-muted">
              La afiliación no es automática: la Cámara revisa cada solicitud antes de activarla.
            </p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-3">
            {JOINING_STEPS.map(({ title, detail, Icon }, index) => (
              <li key={title} className="flex flex-col gap-3">
                <span className="flex size-11 items-center justify-center rounded-pill bg-brand text-on-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold tracking-tight">
                  <span className="text-content-muted">{index + 1}.</span> {title}
                </h3>
                <p className="text-sm text-content-muted">{detail}</p>
              </li>
            ))}
          </ol>

          <Link
            href={JOIN_ENTRY.href}
            className="flex w-fit items-center gap-2 rounded-control bg-brand px-5 py-3 font-medium text-on-brand"
          >
            {JOIN_ENTRY.label}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
