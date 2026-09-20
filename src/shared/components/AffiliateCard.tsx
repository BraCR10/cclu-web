import { BrandMark } from './BrandMark';

type AffiliateCardProps = {
  businessName: string;
  kind: string;
  memberCode: string;
  affiliatedSince: string;
  // The rendered SVG. Left out where there is nothing worth scanning.
  qr?: string;
  // On the public page the name of the business is the page's own subject; in
  // the panel it sits below the screen's heading.
  headingLevel?: 'h1' | 'h2';
};

const dateFormatter = new Intl.DateTimeFormat('es-CR', { month: 'long', year: 'numeric' });

// The card itself, with no idea where its contents came from. A member reads it
// in their own panel and a stranger reads the same one in the directory, and
// the two should not be able to drift apart.
export function AffiliateCard({
  businessName,
  kind,
  memberCode,
  affiliatedSince,
  qr,
  headingLevel: Heading = 'h2',
}: AffiliateCardProps) {
  return (
    <article className="animate-panel-in w-full max-w-md overflow-hidden rounded-panel border border-border bg-surface-raised shadow-xl">
      <header className="relative overflow-hidden bg-linear-to-br from-wash-from to-wash-to px-6 py-5 text-on-wash">
        {/* The sun of the mark, enlarged and bled off the corner. */}
        <div className="pointer-events-none absolute -top-16 -right-12 size-44 rounded-full bg-highlight opacity-30 blur-3xl" />
        <BrandMark size="xs" compact className="relative" />
      </header>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <Heading className="text-xl font-semibold tracking-tight text-balance">
            {businessName}
          </Heading>
          <p className="text-sm text-content-muted">{kind}</p>
        </div>

        {/* Below about three hundred and sixty pixels the row does not fit: the
            panel leaves 240 of them, the code block takes 128 and the gap 20,
            and the code itself needs more than the 92 that remain. */}
        <div className="flex flex-col items-start gap-4 min-[23rem]:flex-row min-[23rem]:items-center min-[23rem]:gap-5">
          {qr !== undefined && (
            // The library builds this from an address this application made, so
            // no text a person typed reaches the markup.
            <div
              aria-hidden
              className="size-32 shrink-0 rounded-control bg-white p-2 [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          )}

          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium tracking-widest text-content-muted uppercase">
              Código de agremiado
            </span>
            <span className="font-mono text-2xl font-semibold tracking-wider tabular-nums">
              {memberCode}
            </span>
            <span className="w-fit rounded-pill bg-support px-2.5 py-0.5 text-xs font-medium text-on-support">
              Afiliación activa
            </span>
          </div>
        </div>

        <p className="border-t border-border pt-4 text-xs text-content-muted">
          Afiliado desde {dateFormatter.format(new Date(affiliatedSince))}
        </p>
      </div>
    </article>
  );
}
