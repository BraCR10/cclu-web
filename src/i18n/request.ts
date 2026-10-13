import { getRequestConfig } from 'next-intl/server';
import { locale, messages } from './messages';

// Spanish is the only language, so the locale is fixed and never appears in
// the URL.
export default getRequestConfig(async () => ({ locale, messages }));
