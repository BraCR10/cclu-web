// Dates are shown on the clock of whoever is looking. The browser names its
// zone once and keeps it in this cookie, so the server renders in the same zone
// and the page does not change between the two. Until it has, and for a zone
// the browser could not name, the chamber's is used.
export const CHAMBER_TIME_ZONE = 'America/Costa_Rica';
export const TIME_ZONE_COOKIE = 'cclu_time_zone';

const MAXIMUM_ZONE_LENGTH = 64;
// Zone names are letters, digits and _ + - /, as in America/Costa_Rica or
// Etc/GMT+5. Anything else is refused before the runtime is asked about it.
const ZONE_NAME = /^[A-Za-z0-9_+\-/]+$/;

// The cookie is written by a browser, so its value is checked before it reaches
// a formatter. The runtime itself is asked whether it can format in that zone,
// rather than a list it publishes: each runtime lists only canonical names, so a
// browser reporting an older one, such as Asia/Calcutta or Etc/UTC, would be
// refused its own zone.
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > MAXIMUM_ZONE_LENGTH || !ZONE_NAME.test(value)) {
    return false;
  }

  try {
    // Asked, not used to show anything, so the rule against formatting dates by
    // hand does not apply here.
    // eslint-disable-next-line no-restricted-syntax
    new Intl.DateTimeFormat('es', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function viewerTimeZone(stored: unknown): string {
  return isTimeZone(stored) ? stored : CHAMBER_TIME_ZONE;
}
