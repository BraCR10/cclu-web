import { describe, it, expect } from 'vitest';
import { noticeForRefusal, toneForNotice } from '@/modules/auth/noticeForRefusal';
import { ApiError } from '@/shared/api/apiError';

function refusal(code: string) {
  return new ApiError({ status: 403, code, message: 'refused' });
}

describe('noticeForRefusal', () => {
  it('reads the state of an account out of the code the refusal carries', () => {
    expect(noticeForRefusal(refusal('application_pending'))).toBe('pending');
    expect(noticeForRefusal(refusal('application_rejected'))).toBe('rejected');
    expect(noticeForRefusal(refusal('account_suspended'))).toBe('suspended');
    expect(noticeForRefusal(refusal('invitation_pending'))).toBe('invitationPending');
    expect(noticeForRefusal(refusal('invitation_expired'))).toBe('invitationExpired');
    expect(noticeForRefusal(refusal('account_inactive'))).toBe('inactive');
  });

  // Wrong credentials say nothing about the account, and a notice here would
  // turn the sign in form into a way of asking who is affiliated.
  it('says nothing about a refusal that is not a state', () => {
    expect(noticeForRefusal(refusal('invalid_credentials'))).toBe(null);
    expect(noticeForRefusal(new Error('something else'))).toBe(null);
    expect(noticeForRefusal('not even an error')).toBe(null);
  });

  // Waiting to be read is not a failure, and painting it red would make somebody
  // think they had been refused.
  it('draws a wait in a different colour from a refusal', () => {
    expect(toneForNotice('pending')).toBe('info');
    expect(toneForNotice('invitationPending')).toBe('info');
    expect(toneForNotice('rejected')).toBe('error');
    expect(toneForNotice('suspended')).toBe('error');
    expect(toneForNotice('inactive')).toBe('error');
  });
});
