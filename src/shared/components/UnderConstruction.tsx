import { useTranslations } from 'next-intl';

export function UnderConstruction() {
  const translate = useTranslations('common.underConstruction');

  return (
    <section className="mx-auto flex w-full max-w-page flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center lg:px-20">
      <h1 className="font-display text-heading-xl text-fg">{translate('title')}</h1>
      <p className="text-body-m text-fg-muted">{translate('body')}</p>
    </section>
  );
}
