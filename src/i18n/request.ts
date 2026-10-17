import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { formats } from './formats';
import { locale, messages } from './messages';
import { TIME_ZONE_COOKIE, viewerTimeZone } from './timeZone';

// Spanish is the only language, so the locale is fixed and never appears in
// the URL. The time zone is the viewer's, and travels with the formats to every
// client component.
export default getRequestConfig(async () => {
  const stored = (await cookies()).get(TIME_ZONE_COOKIE)?.value;

  return { locale, messages, formats, timeZone: viewerTimeZone(stored) };
});
