import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/request';
import {
  DECISION_MESSAGES,
  decisionLeftListStale,
  decisionMessageFor,
  daysWaiting,
  waitingTone,
} from '@/modules/admin/applicationRules';

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

const NOW = new Date('2026-09-19T12:00:00.000Z');

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('daysWaiting', () => {
  it('counts whole days only', () => {
    expect(daysWaiting(daysAgo(0), NOW)).toBe(0);
    expect(daysWaiting(daysAgo(4), NOW)).toBe(4);
  });

  it('never reports a negative wait for a date in the future', () => {
    expect(daysWaiting(new Date(NOW.getTime() + 60_000).toISOString(), NOW)).toBe(0);
  });

  it('answers zero rather than a broken number for an unreadable date', () => {
    expect(daysWaiting('not a date', NOW)).toBe(0);
  });
});

describe('waitingTone', () => {
  it('grades the wait so a backlog shows itself', () => {
    expect(waitingTone(daysAgo(1), NOW)).toBe('calm');
    expect(waitingTone(daysAgo(3), NOW)).toBe('notable');
    expect(waitingTone(daysAgo(7), NOW)).toBe('urgent');
    expect(waitingTone(daysAgo(30), NOW)).toBe('urgent');
  });
});
