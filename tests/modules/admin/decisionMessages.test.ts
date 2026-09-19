import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/request';
import {
  DECISION_MESSAGES,
  decisionLeftListStale,
  decisionMessageFor,
} from '@/modules/admin/decisionMessages';

describe('decisionMessageFor', () => {
  it('reports a race as news rather than as a fault', () => {
    expect(decisionMessageFor(new ApiError(409, 'Conflict'))).toBe(
      DECISION_MESSAGES.alreadyDecided,
    );
  });

  it('separates a missing application from a failed one', () => {
    expect(decisionMessageFor(new ApiError(404, 'Not Found'))).toBe(DECISION_MESSAGES.gone);
    expect(decisionMessageFor(new ApiError(500, 'Server Error'))).toBe(
      DECISION_MESSAGES.unavailable,
    );
  });

  it('asks for the reason when the API refused for want of one', () => {
    expect(decisionMessageFor(new ApiError(400, 'Bad Request'))).toBe(
      DECISION_MESSAGES.reasonRequired,
    );
  });

  it('explains a role that cannot decide', () => {
    expect(decisionMessageFor(new ApiError(403, 'Forbidden'))).toBe(DECISION_MESSAGES.notAllowed);
  });

  it('falls back when the failure was not the API answering', () => {
    expect(decisionMessageFor(new TypeError('network down'))).toBe(DECISION_MESSAGES.unavailable);
  });
});

describe('decisionLeftListStale', () => {
  it('is true only when the list no longer matches the database', () => {
    expect(decisionLeftListStale(new ApiError(409, 'Conflict'))).toBe(true);
    expect(decisionLeftListStale(new ApiError(404, 'Not Found'))).toBe(true);
    expect(decisionLeftListStale(new ApiError(500, 'Server Error'))).toBe(false);
    expect(decisionLeftListStale(new TypeError('network down'))).toBe(false);
  });
});
