'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { readActivities, type CatalogActivity } from '@/shared/api/catalogs';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { useDistricts } from '@/shared/hooks/useDistricts';
import { useCantonOptions } from '@/modules/admin/hooks/useCantonOptions';
import type { ReportFilterName, ReportFilters } from '../api/reports';

const PLANS = ['free', 'lite', 'pro', 'premium'] as const;
const MEMBER_TYPES = ['business', 'association', 'independent_professional'] as const;
const ACCOUNT_STATUSES = ['active', 'suspended'] as const;

function useActivityOptions() {
  const [activities, setActivities] = useState<CatalogActivity[]>([]);

  useEffect(() => {
    let cancelled = false;

    readActivities()
      .then((list) => !cancelled && setActivities(list))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return activities;
}

type ReportFilterFieldsProps = {
  shown: ReportFilterName[];
  filters: ReportFilters;
  change: (changes: Partial<ReportFilters>) => void;
};

// Only the filters the chosen report takes; one that does not apply to it is
// not drawn at all.
export function ReportFilterFields({ shown, filters, change }: ReportFilterFieldsProps) {
  const translate = useTranslations('admin.reports.filters');
  const translateReports = useTranslations('admin.reports');
  const cantons = useCantonOptions();
  const activities = useActivityOptions();
  const districts = useDistricts(filters.canton);
  const has = (name: ReportFilterName) => shown.includes(name);

  return (
    <>
      {has('canton') && (
        <Select
          label={translate('canton')}
          value={filters.canton}
          options={[
            { value: '', label: translate('allCantons') },
            ...cantons.map((canton) => ({ value: canton._id, label: canton.name })),
          ]}
          onChange={(event) => change({ canton: event.target.value, district: '' })}
        />
      )}
      {has('district') && (
        <Select
          label={translate('district')}
          value={filters.district}
          disabled={filters.canton === ''}
          options={[
            { value: '', label: translate('allDistricts') },
            ...districts.map((district) => ({ value: district, label: district })),
          ]}
          onChange={(event) => change({ district: event.target.value })}
        />
      )}
      {has('plan') && (
        <Select
          label={translate('plan')}
          value={filters.plan}
          options={[
            { value: '', label: translate('allPlans') },
            ...PLANS.map((plan) => ({ value: plan, label: translateReports(`plans.${plan}`) })),
          ]}
          onChange={(event) => change({ plan: event.target.value })}
        />
      )}
      {has('memberType') && (
        <Select
          label={translate('memberType')}
          value={filters.memberType}
          options={[
            { value: '', label: translate('allMemberTypes') },
            ...MEMBER_TYPES.map((type) => ({
              value: type,
              label: translateReports(`memberTypes.${type}`),
            })),
          ]}
          onChange={(event) => change({ memberType: event.target.value })}
        />
      )}
      {has('activity') && (
        <Select
          label={translate('activity')}
          value={filters.activity}
          options={[
            { value: '', label: translate('allActivities') },
            ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
          ]}
          onChange={(event) => change({ activity: event.target.value })}
        />
      )}
      {has('accountStatus') && (
        <Select
          label={translate('accountStatus')}
          value={filters.accountStatus}
          options={[
            { value: '', label: translate('allAccountStatuses') },
            ...ACCOUNT_STATUSES.map((status) => ({
              value: status,
              label: translateReports(`accountStatuses.${status}`),
            })),
          ]}
          onChange={(event) => change({ accountStatus: event.target.value })}
        />
      )}
      {has('from') && (
        <Input
          type="date"
          label={translate('from')}
          value={filters.from}
          max={filters.to || undefined}
          onChange={(event) => change({ from: event.target.value })}
        />
      )}
      {has('to') && (
        <Input
          type="date"
          label={translate('to')}
          value={filters.to}
          min={filters.from || undefined}
          onChange={(event) => change({ to: event.target.value })}
        />
      )}
    </>
  );
}
