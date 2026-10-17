import type { Formats } from 'next-intl';

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
