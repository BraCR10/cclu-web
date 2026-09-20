const UNITS: { unit: Intl.RelativeTimeFormatUnit; milliseconds: number }[] = [
  { unit: 'year', milliseconds: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', milliseconds: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', milliseconds: 24 * 60 * 60 * 1000 },
  { unit: 'hour', milliseconds: 60 * 60 * 1000 },
  { unit: 'minute', milliseconds: 60 * 1000 },
];

const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

// Always numeric, because the length of a wait is read as a quantity. The other
// formatter would answer "ayer", which cannot follow the word "Esperando".
const quantityFormatter = new Intl.RelativeTimeFormat('es', { numeric: 'always' });

// How long someone has been waiting says more than the date they applied, and
// it is the reason the oldest application is shown first.
export function elapsedMilliseconds(isoDate: string, now: Date = new Date()): number | null {
  const moment = new Date(isoDate);

  return Number.isNaN(moment.getTime()) ? null : Math.max(0, now.getTime() - moment.getTime());
}

export function describeElapsedTime(isoDate: string, now: Date = new Date()): string {
  const elapsed = elapsedMilliseconds(isoDate, now);

  if (elapsed === null) {
    return '';
  }

  for (const { unit, milliseconds } of UNITS) {
    if (elapsed >= milliseconds) {
      return formatter.format(-Math.floor(elapsed / milliseconds), unit);
    }
  }

  return 'hace un momento';
}

export function describeWaitLength(isoDate: string, now: Date = new Date()): string {
  const elapsed = elapsedMilliseconds(isoDate, now);

  if (elapsed === null) {
    return '';
  }

  for (const { unit, milliseconds } of UNITS) {
    if (elapsed >= milliseconds) {
      return quantityFormatter
        .format(-Math.floor(elapsed / milliseconds), unit)
        .replace(/^hace /, '');
    }
  }

  return 'unos momentos';
}

// Grouped only for reading aloud. The stored value has no separators, so the
// grouping is added here and never sent back.
export function formatMemberCode(code: string): string {
  if (!/^[0-9A-Z]{7}$/.test(code)) {
    return code;
  }

  return `${code.slice(0, 1)}-${code.slice(1, 5)}-${code.slice(5)}`;
}
