import type { Messages } from './messages';

declare module 'next-intl' {
  interface AppConfig {
    Locale: 'es';
    Messages: Messages;
  }
}
