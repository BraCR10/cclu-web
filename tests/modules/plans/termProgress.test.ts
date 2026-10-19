import { describe, it, expect } from 'vitest';
import { termProgress } from '@/modules/plans/termProgress';

const DAY = 24 * 60 * 60 * 1000;
const STARTED = '2026-09-01T06:00:00.000Z';
const EXPIRES = '2026-12-01T06:00:00.000Z';

describe('how much of a term is left', () => {
  it('counts the days left and how much of the term has gone', () => {
    const now = new Date(Date.parse(STARTED) + 30 * DAY);

    const progress = termProgress(STARTED, EXPIRES, now);

    expect(progress?.daysLeft).toBe(61);
    expect(progress?.elapsed).toBeCloseTo(30 / 91, 5);
  });

  // A term that ends later today still has that day to use.
  it('counts a part of a day as a day left', () => {
    const now = new Date(Date.parse(EXPIRES) - 2 * 60 * 60 * 1000);

    expect(termProgress(STARTED, EXPIRES, now)?.daysLeft).toBe(1);
  });

  it('never goes past the end of the term', () => {
    const now = new Date(Date.parse(EXPIRES) + 5 * DAY);

    expect(termProgress(STARTED, EXPIRES, now)).toEqual({ daysLeft: 0, elapsed: 1 });
  });

  it('has nothing to measure without both ends of the term', () => {
    expect(termProgress(null, EXPIRES, new Date())).toBeNull();
    expect(termProgress(STARTED, null, new Date())).toBeNull();
  });
});
