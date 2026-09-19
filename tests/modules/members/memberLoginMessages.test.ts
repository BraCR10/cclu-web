import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/request';
import { MESSAGES, messageFor } from '@/modules/members/memberLoginMessages';
import { REFUSAL_REASONS } from '@/modules/members/api/memberSession';

describe('messageFor', () => {
  it('says the same thing for a wrong password as for an address that is not an account', () => {
    expect(messageFor(new ApiError(401, 'Unauthorized'))).toBe(MESSAGES.invalid);
  });

  it('never hints at an account when the password was wrong', () => {
    const shown = messageFor(new ApiError(401, 'Unauthorized'));

    expect(shown).not.toContain('solicitud');
    expect(shown).not.toContain('revisión');
    expect(shown).not.toContain('rechazada');
  });

  it('explains a pending application, which the API only names once the password was right', () => {
    const shown = messageFor(new ApiError(403, 'Forbidden', REFUSAL_REASONS.APPLICATION_PENDING));

    expect(shown).toBe(MESSAGES.pending);
  });

  it('explains a rejected application and points at the message that carries the reason', () => {
    expect(messageFor(new ApiError(403, 'Forbidden', REFUSAL_REASONS.APPLICATION_REJECTED))).toBe(
      MESSAGES.rejected,
    );
  });

  it('explains a suspended account', () => {
    expect(messageFor(new ApiError(403, 'Forbidden', REFUSAL_REASONS.ACCOUNT_SUSPENDED))).toBe(
      MESSAGES.suspended,
    );
  });

  it('separates a rate limit from credentials that were wrong', () => {
    expect(messageFor(new ApiError(429, 'Too Many Requests'))).toBe(MESSAGES.tooManyAttempts);
  });

  it('falls back rather than inventing a message for a reason it does not know', () => {
    expect(messageFor(new ApiError(403, 'Forbidden', 'algo_nuevo'))).toBe(MESSAGES.unavailable);
    expect(messageFor(new ApiError(403, 'Forbidden'))).toBe(MESSAGES.unavailable);
  });

  it('treats anything that is not an API answer as the server being unavailable', () => {
    expect(messageFor(new Error('network down'))).toBe(MESSAGES.unavailable);
    expect(messageFor(undefined)).toBe(MESSAGES.unavailable);
  });
});
