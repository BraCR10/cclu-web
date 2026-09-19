import { BrandMark } from '@/shared/components/BrandMark';

const SECTIONS = [
  {
    title: 'Directorio de afiliados',
    description: 'Los comercios y profesionales agremiados, con su ficha y su código.',
  },
  {
    title: 'Marketplace',
    description: 'Productos, servicios, promociones y descuentos entre afiliados.',
  },
  {
    title: 'Bolsa de empleo',
    description: 'Vacantes publicadas por los comercios del cantón.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="relative overflow-hidden bg-linear-to-br from-wash-from to-wash-to text-on-wash">
        {/* The sun of the mark, enlarged and bled off the corner. */}
        <div className="pointer-events-none absolute -top-36 -right-20 size-[30rem] rounded-full bg-highlight opacity-40 blur-[100px]" />

        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 sm:py-24">
          <BrandMark size="md" />

          <div className="flex max-w-2xl flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              El comercio de La Unión, en un solo lugar.
            </h1>
            <p className="text-lg opacity-80 sm:text-xl">
              Directorio de comercios afiliados, marketplace y bolsa de empleo. La plataforma está
              en construcción.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <ul className="grid gap-4 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <li
              key={section.title}
              className="flex flex-col gap-2 rounded-panel border border-border bg-surface-raised p-6"
            >
              <span aria-hidden className="h-1 w-10 rounded-pill bg-support" />
              <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
              <p className="text-content-muted">{section.description}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
