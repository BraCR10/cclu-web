import { describe, it, expect } from 'vitest';
import { describeElapsedTime, describeWaitLength } from '@/shared/format/relativeTime';

const NOW = new Date('2026-09-19T12:00:00.000Z');

function ago(milliseconds: number): string {
  return describeElapsedTime(new Date(NOW.getTime() - milliseconds).toISOString(), NOW);
}

function waited(milliseconds: number): string {
  return describeWaitLength(new Date(NOW.getTime() - milliseconds).toISOString(), NOW);
}

describe('describeElapsedTime', () => {
  it('reads the wait in the largest unit that fits', () => {
    expect(ago(3 * 24 * 60 * 60 * 1000)).toContain('3');
    expect(ago(2 * 60 * 60 * 1000)).toContain('2');
  });

  it('says something for a wait shorter than a minute', () => {
    expect(ago(5 * 1000)).toBe('hace un momento');
  });

  it('answers with nothing rather than a broken date', () => {
    expect(describeElapsedTime('not a date', NOW)).toBe('');
  });
});

describe('describeWaitLength', () => {
  it('reads as a quantity so it can follow the word Esperando', () => {
    expect(waited(24 * 60 * 60 * 1000)).toBe('1 día');
    expect(waited(6 * 24 * 60 * 60 * 1000)).toBe('6 días');
    expect(waited(2 * 60 * 60 * 1000)).toBe('2 horas');
  });

  it('never answers with a word that cannot follow it', () => {
    expect(waited(24 * 60 * 60 * 1000)).not.toBe('ayer');
    expect(waited(5 * 1000)).toBe('unos momentos');
  });

  it('answers with nothing rather than a broken date', () => {
    expect(describeWaitLength('not a date', NOW)).toBe('');
  });
});
