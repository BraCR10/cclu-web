'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import type { CatalogActivity } from '../api/registration';
import {
  SHOP_DAYS,
  type ShopDay,
  type ShopScheduleDay,
  type Store,
  type StoreChanges,
} from '../api/store';
import { useStore } from '../hooks/useStore';
import { ProfileTabs } from './ProfileTabs';

type DayDraft = { day: ShopDay; closed: boolean; opensAt: string; closesAt: string };

function daysOf(store: Store): DayDraft[] {
  return SHOP_DAYS.map((day) => {
    const saved = store.schedule.find((entry) => entry.day === day);

    return {
      day,
      // A day nobody set is closed, which is what the API answers as well.
      closed: saved?.closed ?? true,
      opensAt: saved?.opensAt ?? '',
      closesAt: saved?.closesAt ?? '',
    };
  });
}

type StoreFormProps = {
  store: Store;
  activities: CatalogActivity[];
  saving: boolean;
  onSave: (changes: StoreChanges) => Promise<{ ok: boolean; message?: string; field?: string }>;
};

function StoreForm({ store, activities, saving, onSave }: StoreFormProps) {
  const translate = useTranslations('member.store');
  const translateFields = useTranslations('member.store.fields');
  const translateDays = useTranslations('member.store.days');

  const [description, setDescription] = useState(store.businessDescription ?? '');
  const [categories, setCategories] = useState(store.categories.map((category) => category._id));
  const [socials, setSocials] = useState({
    instagram: store.instagram ?? '',
    facebook: store.facebook ?? '',
    linkedin: store.linkedin ?? '',
    website: store.website ?? '',
  });
  const [days, setDays] = useState<DayDraft[]>(() => daysOf(store));
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  const available = activities.filter((activity) => !categories.includes(activity._id));
  const named = (id: string) => activities.find((activity) => activity._id === id)?.name ?? id;

  const changeDay = (day: ShopDay, patch: Partial<DayDraft>) =>
    setDays((current) =>
      current.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)),
    );

  async function submit() {
    setError(null);

    const schedule: ShopScheduleDay[] = days.map(({ day, closed, opensAt, closesAt }) =>
      closed ? { day, closed: true } : { day, closed: false, opensAt, closesAt },
    );

    const outcome = await onSave({
      businessDescription: description,
      categories,
      ...socials,
      schedule,
    });

    if (!outcome.ok) {
      setError({ message: outcome.message ?? '', field: outcome.field });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error !== null && error.field === undefined && <Alert tone="danger" title={error.message} />}

      <Card className="flex flex-col gap-4">
        <h2 className="text-heading-m text-fg">{translate('aboutTitle')}</h2>

        <Textarea
          label={translateFields('description')}
          help={translateFields('descriptionHelp')}
          name="businessDescription"
          value={description}
          error={error?.field === 'businessDescription' ? error.message : undefined}
          maxLength={500}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <Select
            label={translateFields('categories')}
            help={translateFields('categoriesHelp')}
            name="categories"
            value=""
            placeholder={
              available.length === 0
                ? translateFields('categoriesNone')
                : translateFields('categoriesPlaceholder')
            }
            options={available.map((activity) => ({
              value: activity._id,
              label: activity.name,
            }))}
            disabled={available.length === 0}
            error={error?.field === 'categories' ? error.message : undefined}
            onChange={(event) => setCategories((current) => [...current, event.target.value])}
          />

          {categories.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {categories.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() =>
                      setCategories((current) => current.filter((entry) => entry !== id))
                    }
                    className="inline-flex min-h-9 items-center gap-1 rounded-full bg-surface-hover px-3 text-label-s text-fg"
                  >
                    {named(id)}
                    <X aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {(['instagram', 'facebook', 'linkedin', 'website'] as const).map((field) => (
            <Input
              key={field}
              label={translateFields(field)}
              name={field}
              value={socials[field]}
              error={error?.field === field ? error.message : undefined}
              onChange={(event) =>
                setSocials((current) => ({ ...current, [field]: event.target.value }))
              }
            />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <h2 className="text-heading-m text-fg">{translate('scheduleTitle')}</h2>
          <p className="mt-1 text-body-s text-fg-muted">{translate('scheduleHelp')}</p>
        </div>

        {error?.field === 'schedule' && <Alert tone="danger" title={error.message} />}

        <ul className="flex flex-col divide-y divide-line-subtle">
          {days.map((entry) => (
            <li
              key={entry.day}
              role="group"
              aria-label={translateDays(entry.day)}
              className="flex flex-wrap items-center gap-3 py-3"
            >
              <span className="w-24 text-label-m text-fg">{translateDays(entry.day)}</span>

              <label className="flex items-center gap-2 text-body-s text-fg-secondary">
                <input
                  type="checkbox"
                  checked={entry.closed}
                  onChange={(event) => changeDay(entry.day, { closed: event.target.checked })}
                  className="size-4 accent-primary"
                />
                {translate('closed')}
              </label>

              {!entry.closed && (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <Input
                    label={translate('from')}
                    name={`${entry.day}-opensAt`}
                    type="time"
                    value={entry.opensAt}
                    className="w-32"
                    onChange={(event) => changeDay(entry.day, { opensAt: event.target.value })}
                  />
                  <Input
                    label={translate('to')}
                    name={`${entry.day}-closesAt`}
                    type="time"
                    value={entry.closesAt}
                    className="w-32"
                    onChange={(event) => changeDay(entry.day, { closesAt: event.target.value })}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex justify-end">
        <Button type="button" loading={saving} onClick={() => void submit()}>
          {translate('save')}
        </Button>
      </div>
    </div>
  );
}

// M-02-tienda: what the shop says about itself, and the hours a client can walk
// in. The same description the profile shows, set where the shop is configured.
export function StorePage() {
  const translate = useTranslations('member.store');
  const store = useStore(translate('saved'));

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <ProfileTabs active="store" />

      <p className="max-w-2xl text-body-m text-fg-secondary">{translate('description')}</p>

      {store.state === 'loading' && (
        <div aria-hidden className="flex flex-col gap-6">
          <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
          <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      )}

      {store.state === 'failed' && (
        <Alert tone="danger" title={store.failureMessage ?? translate('failed')} />
      )}

      {store.state === 'ready' && store.store !== null && (
        <StoreForm
          store={store.store}
          activities={store.activities}
          saving={store.saving}
          onSave={store.save}
        />
      )}
    </div>
  );
}
