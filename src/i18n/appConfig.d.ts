import type { formats } from './formats';
import type { Messages } from './messages';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'es';
    Messages: Messages;
    Formats: typeof formats;
  }
}
