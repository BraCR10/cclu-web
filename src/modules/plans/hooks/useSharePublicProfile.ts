'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';

type SharedProfile = {
  businessName: string;
  publicUrl: string;
};

function canUseShareSheet(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

// A telephone shares through its own sheet. Where there is none, the link is
// copied instead, so the button always leaves the member with something to paste.
export function useSharePublicProfile({ businessName, publicUrl }: SharedProfile) {
  const translate = useTranslations('member.card');
  const { showToast } = useToast();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast({ tone: 'success', title: translate('copied') });
    } catch {
      showToast({ tone: 'error', title: translate('copyFailed') });
    }
  }

  return async function share() {
    if (!canUseShareSheet()) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title: businessName, url: publicUrl });
    } catch (error) {
      // Closing the sheet without choosing anything is the member changing their
      // mind, not a failure worth a message.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      await copyLink();
    }
  };
}
