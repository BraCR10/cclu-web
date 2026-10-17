import { useTranslations } from 'next-intl';

type ReceiptViewerProps = {
  url: string;
  contentType: string;
  title: string;
};

// The receipt as the chamber stored it, served by the API after it checks who
// is asking. An image is shown as it is; a PDF in a frame the browser renders.
export function ReceiptViewer({ url, contentType, title }: ReceiptViewerProps) {
  const translate = useTranslations('member.payments.receipt');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-80 items-center justify-center overflow-hidden rounded-md border border-line-subtle bg-surface-subtle">
        {contentType === 'application/pdf' ? (
          <iframe src={url} title={title} className="h-[28rem] w-full bg-surface" />
        ) : (
          // The address carries the session through the API, so next/image's
          // optimiser, which fetches without it, cannot be used here.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="max-h-[28rem] w-auto object-contain" />
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="self-start text-label-m text-fg-link underline-offset-4 hover:underline focus-visible:shadow-focus focus-visible:outline-none"
      >
        {translate('open')}
      </a>
    </div>
  );
}
