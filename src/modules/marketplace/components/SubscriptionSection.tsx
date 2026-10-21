'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { ModalLayer } from '@/shared/components/ModalLayer';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { SubscriptionForm } from './SubscriptionForm';

// The home page's invitation to the promotions. On a desktop the form sits in
// the section; on a telephone it opens on a screen of its own, where six fields
// and the consent fit without scrolling a card.
export function SubscriptionSection() {
  const translate = useTranslations('public.subscription');
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="subscription-title"
      className="grid gap-6 rounded-xl bg-brand-union-soft p-6 lg:grid-cols-[1fr_1.4fr] lg:gap-12 lg:p-10"
    >
      <div className="flex flex-col gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-fg-brand">
          <Mail aria-hidden className="size-5" />
        </span>
        <h2 id="subscription-title" className="font-display text-heading-xl text-fg">
          {translate('title')}
        </h2>
        {!isDesktop && <Button onClick={() => setOpen(true)}>{translate('open')}</Button>}
      </div>

      {isDesktop && (
        <div className="rounded-lg bg-surface p-6 shadow-raised">
          <SubscriptionForm />
        </div>
      )}

      {!isDesktop && (
        <ModalLayer
          open={open}
          presentation="fullscreen"
          title={translate('title')}
          onClose={() => setOpen(false)}
        >
          <SubscriptionForm onSubscribed={() => setOpen(false)} />
        </ModalLayer>
      )}
    </section>
  );
}
