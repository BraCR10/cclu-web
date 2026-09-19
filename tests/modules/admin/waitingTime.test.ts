import { describe, it, expect } from 'vitest';
import { daysWaiting, waitingTone } from '@/modules/admin/waitingTime';

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
