import { ApiError } from '@/shared/api/apiError';

export type SignInNotice =
  'pending' | 'rejected' | 'suspended' | 'invitationPending' | 'invitationExpired' | 'inactive';

// A refusal for the state of an account carries that state as its code, so this
// is a lookup rather than a guess. A code the sign in screen has no sentence for
// is not a notice and falls through to the ordinary error handling.
const NOTICES_BY_CODE: Record<string, SignInNotice> = {
  application_pending: 'pending',
  application_rejected: 'rejected',
  account_suspended: 'suspended',
  invitation_pending: 'invitationPending',
  invitation_expired: 'invitationExpired',
  account_inactive: 'inactive',
};

export function noticeForRefusal(error: unknown): SignInNotice | null {
  if (!(error instanceof ApiError)) {
    return null;
  }

  return NOTICES_BY_CODE[error.code] ?? null;
}

// A registration waiting to be read is not a failure, and painting it the colour
// of one would make somebody think they had been refused.
export function toneForNotice(notice: SignInNotice): 'info' | 'error' {
  return notice === 'pending' || notice === 'invitationPending' ? 'info' : 'error';
}
