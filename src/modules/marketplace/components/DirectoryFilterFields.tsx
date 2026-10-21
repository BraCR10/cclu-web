import { useTranslations } from 'next-intl';
import { Select } from '@/shared/components/Select';
import type { CatalogActivity, CatalogCanton } from '@/shared/api/catalogs';
import type { DirectoryFilters } from '../api/directory';
import { useDistricts } from '../hooks/useDirectoryCatalogs';

type DirectoryFilterFieldsProps = {
  filters: DirectoryFilters;
  change: (changes: Partial<DirectoryFilters>) => void;
  cantons: CatalogCanton[];
  activities: CatalogActivity[];
};

const FIELD_CLASSES = 'lg:w-56';

export function DirectoryFilterFields({
  filters,
  change,
  cantons,
  activities,
}: DirectoryFilterFieldsProps) {
  const translate = useTranslations('public.directory.filters');
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
        label={translate('activity')}
        value={filters.activity}
        options={[
          { value: '', label: translate('allActivities') },
          ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
        ]}
        onChange={(event) => change({ activity: event.target.value })}
      />
    </>
  );
}
