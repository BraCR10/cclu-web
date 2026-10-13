import { useTranslations } from 'next-intl';
import type { Messages } from '@/i18n/messages';
import { decideErrorDisplay } from './decideErrorDisplay';

type ErrorMessageKey = keyof Messages['errors'];

export type PresentedError =
  { placement: 'field'; field: string; message: string } | { placement: 'toast'; message: string };

export function useErrorPresenter(): (error: unknown) => PresentedError {
  const translate = useTranslations('errors');

  return (error) => {
    const { messageKey, ...display } = decideErrorDisplay(error, (code) =>
      translate.has(code as ErrorMessageKey),
    );

    return { ...display, message: translate(messageKey as ErrorMessageKey) };
  };
}
