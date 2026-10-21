'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { useCurrentViewer } from '@/shared/hooks/useCurrentViewer';
import { WORKDAYS, type Workday } from '../api/vacancies';
import { useVacancyForm } from '../hooks/useVacancyForm';
import { VacancyCard } from './VacancyCard';

const LIMITS = { title: 80, description: 800, requirements: 500, howToApply: 300 };

// M-10: a new vacancy beside the card the job board will show for it.
export function NewVacancyPage() {
  const translate = useTranslations('member.vacancies.form');
  const translateWorkday = useTranslations('public.jobs.workdays');
  const viewer = useCurrentViewer();
  const form = useVacancyForm();
  const { draft, errors } = form;
  const branch = form.branches.find((option) => option.id === draft.branch) ?? null;

  return (
    <div className="grid items-start gap-6 px-4 py-6 lg:grid-cols-[1fr_22rem] lg:gap-8 lg:px-8 lg:py-8">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.submit();
        }}
        className="flex flex-col gap-5 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6"
      >
        <Input
          label={translate('title')}
          value={draft.title}
          maxLength={LIMITS.title}
          error={errors.title}
          onChange={(event) => form.change('title', event.target.value)}
        />
        <Textarea
          label={translate('description')}
          value={draft.description}
          maxLength={LIMITS.description}
          error={errors.description}
          onChange={(event) => form.change('description', event.target.value)}
        />
        <Textarea
          label={translate('requirements')}
          help={translate('requirementsHelp')}
          value={draft.requirements}
          maxLength={LIMITS.requirements}
          error={errors.requirements}
          onChange={(event) => form.change('requirements', event.target.value)}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <Select
            label={translate('branch')}
            placeholder={translate('choose')}
            value={draft.branch}
            error={errors.branch}
            options={form.branches.map((option) => ({ value: option.id, label: option.name }))}
            onChange={(event) => form.change('branch', event.target.value)}
          />
          <Select
            label={translate('workday')}
            placeholder={translate('choose')}
            value={draft.workday}
            error={errors.workday}
            options={WORKDAYS.map((workday) => ({
              value: workday,
              label: translateWorkday(workday),
            }))}
            onChange={(event) => form.change('workday', event.target.value as Workday)}
          />
        </div>
        <Textarea
          label={translate('howToApply')}
          help={translate('howToApplyHelp')}
          value={draft.howToApply}
          maxLength={LIMITS.howToApply}
          error={errors.howToApply}
          onChange={(event) => form.change('howToApply', event.target.value)}
        />
        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:justify-end">
          <Link
            href="/member/vacancies"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg hover:bg-surface-hover lg:min-h-10"
          >
            {translate('cancel')}
          </Link>
          <Button type="submit" loading={form.sending}>
            <Check aria-hidden className="size-4" />
            {translate('publish')}
          </Button>
        </div>
      </form>

      <aside className="flex flex-col gap-3">
        <h2 className="text-label-l text-fg">{translate('preview')}</h2>
        <VacancyCard
          title={draft.title}
          businessName={viewer?.name ?? ''}
          branch={branch}
          workday={draft.workday}
          publishedAt={null}
        />
      </aside>
    </div>
  );
}
