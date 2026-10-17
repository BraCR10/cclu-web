// Dates are shown on the clock of whoever is looking. The browser names its
// zone once and keeps it in this cookie, so the server renders in the same zone
// and the page does not change between the two. Until it has, and for a zone
// the browser could not name, the chamber's is used.
export const CHAMBER_TIME_ZONE = 'America/Costa_Rica';
export const TIME_ZONE_COOKIE = 'cclu_time_zone';

const MAXIMUM_ZONE_LENGTH = 64;

let knownZones: Set<string> | null = null;

// The cookie is written by a browser, so its value is checked against the
// zones the runtime knows rather than handed to a formatter as it arrives.
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAXIMUM_ZONE_LENGTH) {
    return false;
  }

  knownZones ??= new Set(['UTC', ...Intl.supportedValuesOf('timeZone')]);

  return knownZones.has(value);
}

export function viewerTimeZone(stored: unknown): string {
  return isTimeZone(stored) ? stored : CHAMBER_TIME_ZONE;
}
