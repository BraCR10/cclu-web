import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { CHAMBER_WHATSAPP_HREF } from '../paymentMethods';

const QUESTIONS = ['cost', 'late', 'change', 'approval', 'invoice', 'discounts'] as const;

// Native disclosure elements, so every answer opens from the keyboard and is
// announced as expandable without any script.
export function PlansFaq() {
  const translate = useTranslations('plans');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section aria-labelledby="plans-faq" className="flex flex-col gap-4">
        <h2 id="plans-faq" className="font-display text-heading-l text-fg">
          {translate('faq.title')}
        </h2>
        <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface">
          {QUESTIONS.map((question, index) => (
            <details
              key={question}
              open={index === 0}
              className="group border-b border-line-subtle last:border-b-0"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-label-m text-fg focus-visible:shadow-focus focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                {translate(`faq.items.${question}.question`)}
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-fg-secondary transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-4 pb-4 text-body-s text-fg-secondary">
                {translate(`faq.items.${question}.answer`)}
              </p>
            </details>
          ))}
        </div>
      </section>

      <Card
        as="aside"
        aria-labelledby="plans-contact"
        className="flex flex-col gap-3 bg-brand-union-soft lg:mt-12"
      >
        <h2 id="plans-contact" className="font-display text-heading-s text-fg">
          {translate('contact.title')}
        </h2>
        <p className="text-body-s text-fg-secondary">{translate('contact.message')}</p>
        <a
          href={CHAMBER_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
        >
          {translate('contact.action')}
        </a>
      </Card>
    </div>
  );
}
