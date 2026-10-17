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

// The two kinds of date the API sends, kept apart on purpose. An instant is a
// moment, shown in the chamber's time zone. A calendar day, such as the last
// day a plan is valid, is shown exactly as written.
export function useDates() {
  const format = useFormatter();

  return {
    instant: (value: string | Date, style: DateStyle = 'date') =>
      format.dateTime(new Date(value), style),
    calendarDay: (isoDate: string, style: DateStyle = 'date') =>
      format.dateTime(calendarDayInstant(isoDate), style, { timeZone: 'UTC' }),
  };
}
