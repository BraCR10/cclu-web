import Image from 'next/image';
import { useTranslations } from 'next-intl';
import QRCode from 'react-qr-code';
import { ModalLayer } from '@/shared/components/ModalLayer';
import { StatusBadge } from '@/shared/components/StatusBadge';
import type { Membership } from '../api/membership';
import { PlanBadge } from '@/shared/components/PlanBadge';

type MemberCardFullscreenProps = {
  open: boolean;
  membership: Membership;
  publicUrl: string;
  onClose: () => void;
};

// The card held up at the counter. A customer scans it at arm's length, so the
// QR takes the room the screen has, on white for the strongest contrast, with
// just enough beside it to tell whose it is.
export function MemberCardFullscreen({
  open,
  membership,
  publicUrl,
  onClose,
}: MemberCardFullscreenProps) {
  const translate = useTranslations('member.card');
  const { businessName, memberCode, plan, lapsed } = membership;

  return (
    <ModalLayer
      open={open}
      title={translate('shownTitle')}
      presentation="fullscreen"
      onClose={onClose}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-4 text-center">
        <Image
          src="/brand/card/cclu-logo.png"
          alt={translate('chamber')}
          width={136}
          height={44}
          className="h-11 w-[136px] object-contain"
        />

        <div className="flex flex-col items-center gap-1">
          <p className="font-display text-heading-l text-fg">{businessName}</p>
          <p className="font-display text-metric-xl whitespace-nowrap text-fg">{memberCode}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <PlanBadge planKey={plan.key} name={plan.name} />
          <StatusBadge
            tone={lapsed === null ? 'success' : 'warning'}
            label={translate(lapsed === null ? 'active' : 'lapsed')}
          />
        </div>

        <div className="rounded-lg border border-line-subtle bg-surface p-4">
          {publicUrl === '' ? (
            <div aria-hidden className="aspect-square w-[min(70vw,45dvh,20rem)]" />
          ) : (
            <QRCode
              value={publicUrl}
              size={320}
              level="M"
              bgColor="#ffffff"
              fgColor="#13212c"
              title={translate('qrTitle')}
              className="aspect-square h-auto w-[min(70vw,45dvh,20rem)]"
            />
          )}
        </div>

        <p className="text-body-s text-fg-secondary">{translate('shownHint')}</p>
      </div>
    </ModalLayer>
  );
}
