'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Checkbox } from '@/shared/components/Checkbox';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { useSubscriptionForm } from '../hooks/useSubscriptionForm';

export function SubscriptionForm({ onSubscribed = () => {} }: { onSubscribed?: () => void }) {
  const translate = useTranslations('public.subscription');
  const form = useSubscriptionForm(onSubscribed);
  const { draft, errors } = form;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
      className="flex flex-col gap-4"
    >
      <Input
        label={translate('name')}
        value={draft.name}
        maxLength={120}
        autoComplete="name"
        error={errors.name}
        onChange={(event) => form.change('name', event.target.value)}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Select
          label={translate('canton')}
          placeholder={translate('chooseCanton')}
          value={draft.canton}
          error={errors.canton}
          options={form.cantons.map((canton) => ({
            value: canton._id,
            label: `${canton.name}, ${canton.province}`,
          }))}
          onChange={(event) => form.change('canton', event.target.value)}
        />
        <Input
          label={translate('district')}
          value={draft.district}
          maxLength={80}
          error={errors.district}
          onChange={(event) => form.change('district', event.target.value)}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Input
          label={translate('email')}
          type="email"
          value={draft.email}
          maxLength={254}
          autoComplete="email"
          error={errors.email}
          onChange={(event) => form.change('email', event.target.value)}
        />
        <Input
          label={translate('whatsapp')}
          type="tel"
          value={draft.whatsappNumber}
          maxLength={20}
          autoComplete="tel"
          error={errors.whatsappNumber}
          onChange={(event) => form.change('whatsappNumber', event.target.value)}
        />
      </div>
      <Checkbox
        label={translate('consent')}
        checked={draft.acceptsPromotions}
        error={errors.acceptsPromotions}
        onChange={(event) => form.change('acceptsPromotions', event.target.checked)}
      />
      <p className="text-body-s text-fg-secondary">{translate('legal')}</p>
      <Link href="/privacy" className="self-start text-label-s text-fg-link underline">
        {translate('privacy')}
      </Link>
      <Button type="submit" loading={form.sending} className="lg:self-start">
        {translate('submit')}
      </Button>
    </form>
  );
}
