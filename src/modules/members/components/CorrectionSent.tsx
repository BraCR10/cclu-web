import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { DescriptionList } from '@/shared/components/DescriptionList';
import { StatusBadge } from '@/shared/components/StatusBadge';

// What the applicant keeps after sending their corrections back: the
// application is under review again, and the address the chamber will write to
// is the one they cannot check anywhere else yet.
export function CorrectionSent({ sent }: { sent: { businessName: string; email: string } }) {
  const translate = useTranslations('correction.sent');

  return (
    <Card className="p-6 lg:p-8">
      <CircleCheck aria-hidden="true" className="h-10 w-10 text-success" />
      <h1 className="mt-4 text-heading-xl text-fg">{translate('title')}</h1>
      <p className="mt-2 text-body-l text-fg-secondary">
        {translate('thanks', { businessName: sent.businessName, email: sent.email })}
      </p>

      <div className="mt-6 border-y border-line-subtle py-4">
        <DescriptionList
          items={[
            {
              term: translate('state'),
              detail: <StatusBadge tone="info" label={translate('stateValue')} />,
            },
            { term: translate('business'), detail: sent.businessName },
          ]}
        />
      </div>

      <p className="mt-6 text-body-m text-fg-secondary">{translate('next')}</p>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary"
        >
          {translate('goHome')}
        </Link>
        <Link href="/login" className="text-label-m text-fg-link">
          {translate('signIn')}
        </Link>
      </div>
    </Card>
  );
}
