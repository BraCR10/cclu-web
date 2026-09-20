import Link from 'next/link';
import { BrandMark } from './BrandMark';
import {
  JOIN_ENTRY,
  SECTION_STATUS,
  SECTION_STATUS_LABELS,
  SIGN_IN_ENTRIES,
  SITE_SECTIONS,
} from '@/shared/config/siteNavigation';

const CURRENT_YEAR = new Date().getFullYear();

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium tracking-widest text-content-muted uppercase">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label, note }: { href: string; label: string; note?: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2 text-sm hover:text-brand">
        {label}
        {note !== undefined && (
          <span className="rounded-pill border border-border px-2 py-0.5 text-[0.6875rem] text-content-muted">
            {note}
          </span>
        )}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-raised">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <BrandMark size="sm" compact className="text-content" />
          <p className="max-w-xs text-sm text-content-muted">
            Plataforma de la Cámara de Comercio, Turismo, Industria y Afines del Cantón de La Unión.
          </p>
        </div>

        <Column title="Secciones">
          {SITE_SECTIONS.map((section) => (
            <FooterLink
              key={section.href}
              href={section.href}
              label={section.label}
              note={
                section.status === SECTION_STATUS.AVAILABLE
                  ? undefined
                  : SECTION_STATUS_LABELS[section.status]
              }
            />
          ))}
        </Column>

        <Column title="Ingresar">
          {SIGN_IN_ENTRIES.map((entry) => (
            <FooterLink key={entry.href} href={entry.href} label={entry.label} />
          ))}
        </Column>

        <Column title="Afiliarse">
          <FooterLink href={JOIN_ENTRY.href} label={JOIN_ENTRY.label} />
        </Column>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-6 py-5 text-xs text-content-muted">
          © {CURRENT_YEAR} Cámara de Comercio, Turismo, Industria y Afines del Cantón de La Unión.
        </p>
      </div>
    </footer>
  );
}
