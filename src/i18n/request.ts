import { getRequestConfig } from 'next-intl/server';
import { formats, timeZone } from './formats';
import { locale, messages } from './messages';

// Spanish is the only language, so the locale is fixed and never appears in
// the URL. The time zone and formats travel with it to every client component.
export default getRequestConfig(async () => ({ locale, messages, timeZone, formats }));
