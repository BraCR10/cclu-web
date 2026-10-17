'use client';

import { useFormatter } from 'next-intl';

export type DateStyle = 'date' | 'short' | 'moment';

const CALENDAR_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

// A day with no time, as YYYY-MM-DD, turned into an instant that names it in
// UTC. Formatted in UTC as well, so no time zone can move it to the day before.
function calendarDayInstant(isoDate: string): Date {
  const parts = CALENDAR_DAY.exec(isoDate);

  if (parts === null) {
    throw new TypeError(`${isoDate} is not a calendar day.`);
  }

  return new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])));
}

const LOCAL_MIDNIGHT = '00:00:00';
const CLOCK = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' } as const;

// The kinds of date the API sends, kept apart on purpose. An instant is a
// moment, shown on the viewer's clock. A calendar day, such as the date on a
// certification, has no time and is shown exactly as written.
export function useDates() {
  const format = useFormatter();
  const instant = (value: string | Date, style: DateStyle = 'date') =>
    format.dateTime(new Date(value), style);

  return {
    instant,
    calendarDay: (isoDate: string, style: DateStyle = 'date') =>
      format.dateTime(calendarDayInstant(isoDate), style, { timeZone: 'UTC' }),

    // When a term ends, given the exclusive instant it ends at. Where that is
    // midnight on the viewer's own calendar, the last day still covered reads
    // best on its own. Anywhere else a day alone would be wrong, so the local
    // time it ends is shown with it.
    termEnd: (expiresAt: string | Date) => {
      const end = new Date(expiresAt);

      return format.dateTime(end, CLOCK) === LOCAL_MIDNIGHT
        ? instant(new Date(end.getTime() - 1))
        : instant(end, 'moment');
    },
  };
}
