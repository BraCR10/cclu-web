import type { Formats } from 'next-intl';

// Every date on screen is read as the chamber reads a calendar, wherever the
// browser happens to be. Named by zone rather than by offset, so a change to
// the country's rules arrives with the time zone database.
export const timeZone = 'America/Costa_Rica';

// The only date styles the interface uses. A component names one of these
// instead of writing its own options, so the same kind of date always reads
// the same way.
export const formats = {
  dateTime: {
    date: { dateStyle: 'long' },
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    // The locale is plain es, whose clock runs to 24 hours. Costa Rica reads
    // the 12 hour clock, so the cycle is stated rather than inherited.
    moment: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h12',
    },
  },
} satisfies Formats;
