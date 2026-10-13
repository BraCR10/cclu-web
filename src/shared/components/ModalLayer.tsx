'use client';

import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useModalBehavior } from '@/shared/hooks/useModalBehavior';
import { classNames } from '@/shared/utils/classNames';

export type ModalPresentation = 'popup' | 'sheet';

type ModalLayerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  presentation: ModalPresentation;
  children: ReactNode;
  footer?: ReactNode;
};

const PANEL_CLASSES: Record<ModalPresentation, string> = {
  popup: 'm-auto w-full max-w-[30rem] rounded-xl p-6',
  sheet: 'mt-auto max-h-[90dvh] w-full overflow-y-auto rounded-t-xl px-4 pt-2 pb-6',
};

// The one place a dialog is assembled. Dialog and BottomSheet only choose how
// it sits on the screen, so focus, Escape and the backdrop behave the same.
export function ModalLayer({
  open,
  title,
  onClose,
  presentation,
  children,
  footer,
}: ModalLayerProps) {
  const titleId = useId();
  const translate = useTranslations('common.actions');
  const { panelRef, handleKeyDown } = useModalBehavior(open, onClose);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex p-0 lg:p-4" onKeyDown={handleKeyDown}>
      <div
        data-testid="modal-scrim"
        aria-hidden
        className="absolute inset-0 bg-inverse/50"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-presentation={presentation}
        tabIndex={-1}
        className={classNames(
          'relative flex flex-col gap-4 bg-surface shadow-overlay focus:outline-none',
          PANEL_CLASSES[presentation],
        )}
      >
        {presentation === 'sheet' && (
          <span aria-hidden className="mx-auto h-1 w-9 shrink-0 rounded-xs bg-line" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h2
            id={titleId}
            className={classNames(
              'font-display text-fg',
              presentation === 'sheet' ? 'text-heading-l' : 'text-heading-m',
            )}
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label={translate('close')}
            onClick={onClose}
            className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-fg-secondary hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="text-body-m text-fg-secondary">{children}</div>
        {footer && (
          <div
            className={classNames(
              'flex gap-3',
              presentation === 'sheet' ? 'flex-col-reverse *:w-full' : 'justify-end',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
