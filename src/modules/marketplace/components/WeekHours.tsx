import { useFormatter, useTranslations } from 'next-intl';
import type { ShopDayHours } from '../api/directory';
import { groupWeek } from '../weekHours';

function useTimeOfDay() {
  const format = useFormatter();

  // A shop's hours are a time on its own clock, not an instant, so they are
  // formatted as written rather than moved to the viewer's zone.
  return (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);

    return format.dateTime(new Date(Date.UTC(2000, 0, 1, hours, minutes)), {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h12',
      timeZone: 'UTC',
    });
  };
}

export function WeekHours({ week }: { week: ShopDayHours[] }) {
  const translate = useTranslations('public.directory.profile');
  const timeOfDay = useTimeOfDay();

  return (
    <dl className="flex flex-col gap-1.5 text-body-s">
      {groupWeek(week).map((group) => (
        <div key={group.from} className="flex justify-between gap-4">
          <dt className="text-fg-secondary">
            {group.from === group.to
              ? translate(`days.${group.from}`)
              : translate('dayRange', {
                  from: translate(`days.${group.from}`),
                  to: translate(`days.${group.to}`).toLowerCase(),
                })}
          </dt>
          <dd className="text-right text-fg">
            {group.hours === null
              ? translate('closed')
              : translate('hoursRange', {
                  opensAt: timeOfDay(group.hours.opensAt),
                  closesAt: timeOfDay(group.hours.closesAt),
                })}
          </dd>
        </div>
      ))}
    </dl>
  );
}
