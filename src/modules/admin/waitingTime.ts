const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// A registration left unanswered is the chamber's problem, not the applicant's,
// so the wait is graded rather than merely stated.
const URGENT_DAYS = 7;
const NOTABLE_DAYS = 3;

export type WaitingTone = 'calm' | 'notable' | 'urgent';

export function daysWaiting(isoDate: string, now: Date = new Date()): number {
  const moment = new Date(isoDate);

  if (Number.isNaN(moment.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - moment.getTime()) / MILLISECONDS_PER_DAY));
}

export function waitingTone(isoDate: string, now: Date = new Date()): WaitingTone {
  const days = daysWaiting(isoDate, now);

  if (days >= URGENT_DAYS) {
    return 'urgent';
  }

  return days >= NOTABLE_DAYS ? 'notable' : 'calm';
}

export const WAITING_TONE_CLASS: Record<WaitingTone, string> = {
  calm: 'border border-border text-content-muted',
  notable: 'border border-highlight text-content',
  urgent: 'bg-highlight text-on-highlight',
};
