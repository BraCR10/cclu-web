import Link from 'next/link';
import { ExternalLink, Maximize2, Printer, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';

type MemberCardActionsProps = {
  publicPath: string;
  onShow: () => void;
  onShare: () => void;
  onPrint: () => void;
};

const LINK_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

// What a member does with the card: hold it up, send it, print it, or see what
// a customer sees after scanning it.
export function MemberCardActions({
  publicPath,
  onShow,
  onShare,
  onPrint,
}: MemberCardActionsProps) {
  const translate = useTranslations('member.card');

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap print:hidden">
      <Button type="button" onClick={onShow}>
        <Maximize2 aria-hidden className="size-4" />
        {translate('show')}
      </Button>
      <Button type="button" variant="secondary" onClick={onShare}>
        <Share2 aria-hidden className="size-4" />
        {translate('share')}
      </Button>
      <Button type="button" variant="secondary" onClick={onPrint}>
        <Printer aria-hidden className="size-4" />
        {translate('print')}
      </Button>
      <Link href={publicPath} target="_blank" rel="noopener noreferrer" className={LINK_CLASSES}>
        <ExternalLink aria-hidden className="size-4" />
        {translate('viewPublic')} <span className="sr-only">{translate('opensInNewTab')}</span>
      </Link>
    </div>
  );
}
