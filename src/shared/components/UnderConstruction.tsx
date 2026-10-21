import { useTranslations } from 'next-intl';

type UnderConstructionProps = {
  headingLevel?: 1 | 2;
};

export function UnderConstruction({ headingLevel = 1 }: UnderConstructionProps) {
  const translate = useTranslations('common.underConstruction');
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
      <Heading className="font-display text-heading-xl text-fg">{translate('title')}</Heading>
    </section>
  );
}
