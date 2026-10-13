import { useTranslations } from 'next-intl';

export function SkipLink() {
  const translate = useTranslations('common.shell');

  return (
    <a
      href="#content"
      className="sr-only z-50 rounded-sm bg-surface px-4 py-2 text-label-m text-fg-brand focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:shadow-focus"
    >
      {translate('skipToContent')}
    </a>
  );
}
