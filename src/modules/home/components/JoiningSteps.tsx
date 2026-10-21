import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { JOIN_HREF } from '@/shared/layouts/publicNavigation';

const STEPS = ['apply', 'review', 'code'] as const;

// How a business joins, in the three steps the chamber actually takes.
export function JoiningSteps() {
  const translate = useTranslations('public.home.joining');

  return (
    <section aria-labelledby="home-joining" className="flex flex-col gap-4">
      <h2 id="home-joining" className="font-display text-heading-l text-fg lg:text-heading-xl">
        {translate('title')}
      </h2>

      <ol className="grid gap-3 lg:grid-cols-3 lg:gap-6">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:flex-col lg:p-6"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-union-soft text-label-m text-fg-brand">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-label-l text-fg">{translate(`steps.${step}.title`)}</h3>
              <p className="text-body-s text-fg-secondary">{translate(`steps.${step}.detail`)}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        href={JOIN_HREF}
        className="inline-flex h-12 items-center justify-center self-stretch rounded-sm bg-primary px-5 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none md:self-start"
      >
        {translate('start')}
      </Link>
    </section>
  );
}
