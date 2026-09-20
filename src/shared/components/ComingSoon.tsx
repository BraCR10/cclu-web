import Link from 'next/link';
import { ArrowRightIcon } from './icons';
import type { SiteSection } from '@/shared/config/siteNavigation';

type ComingSoonProps = {
  section: SiteSection;
  // What already works in this section, when something does. A screen that says
  // only "not yet" hides the part a visitor could be using today.
  children?: React.ReactNode;
};

export function ComingSoon({ section, children }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {section.label}
        </h1>
        <p className="max-w-prose text-lg text-content-muted">{section.summary}</p>
      </div>

      {children}

      {section.coming !== undefined && (
        <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6">
          <h2 className="text-lg font-semibold tracking-tight">Qué incluirá esta sección</h2>

          <ul className="flex flex-col gap-3">
            {section.coming.map((item) => (
              <li key={item} className="flex items-start gap-3 text-content-muted">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-support" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link href="/" className="flex w-fit items-center gap-2 text-sm font-medium text-brand">
        Volver al inicio
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}
