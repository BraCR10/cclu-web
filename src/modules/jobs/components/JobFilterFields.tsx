import { useTranslations } from 'next-intl';
import type { CatalogCanton } from '@/shared/api/catalogs';
import { Select } from '@/shared/components/Select';
import { useDistricts } from '@/shared/hooks/useDistricts';
import { WORKDAYS, type BoardFilters, type Workday } from '../api/vacancies';

type JobFilterFieldsProps = {
  filters: BoardFilters;
  change: (changes: Partial<BoardFilters>) => void;
  cantons: CatalogCanton[];
};

const FIELD_CLASSES = 'lg:w-52';

export function JobFilterFields({ filters, change, cantons }: JobFilterFieldsProps) {
  const translate = useTranslations('public.jobs.filters');
  const translateWorkday = useTranslations('public.jobs.workdays');
  const districts = useDistricts(filters.canton);

  return (
    <>
      <Select
        className={FIELD_CLASSES}
        label={translate('canton')}
        value={filters.canton}
        options={[
          { value: '', label: translate('allCantons') },
          ...cantons.map((canton) => ({ value: canton._id, label: canton.name })),
        ]}
        // A district belongs to one canton, so it does not survive a change of canton.
        onChange={(event) => change({ canton: event.target.value, district: '' })}
      />
      <Select
        className={FIELD_CLASSES}
        label={translate('district')}
        value={filters.district}
        disabled={filters.canton === ''}
        options={[
          { value: '', label: translate('allDistricts') },
          ...districts.map((district) => ({ value: district, label: district })),
        ]}
        onChange={(event) => change({ district: event.target.value })}
      />
      <Select
        className={FIELD_CLASSES}
        label={translate('workday')}
        value={filters.workday}
        options={[
          { value: '', label: translate('allWorkdays') },
          ...WORKDAYS.map((workday) => ({ value: workday, label: translateWorkday(workday) })),
        ]}
        onChange={(event) => change({ workday: event.target.value as Workday | '' })}
      />
    </>
  );
}
