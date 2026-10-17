import { describe, expect, it } from 'vitest';
import { useDates } from '@/shared/hooks/useDates';
import { renderHookWithIntl } from '../../support/renderWithIntl';

function dates(timeZone?: string) {
  return renderHookWithIntl(() => useDates(), timeZone).result.current;
}

// A plan valid through 17 November in Costa Rica ends at midnight opening the
// 18th there, which is this instant everywhere.
const TERM_END = '2026-11-18T06:00:00.000Z';

describe('useDates', () => {
  it('shows an instant on the Costa Rican calendar, whatever the UTC date is', () => {
    // 03:00 UTC on the 18th is 21:00 on the 17th in Costa Rica.
    expect(dates().instant('2026-11-18T03:00:00Z')).toBe('17 de noviembre de 2026');
  });

  it('shows a moment on the 12 hour clock Costa Rica reads', () => {
    expect(dates().instant('2026-10-17T21:40:00Z', 'moment')).toBe('17 oct 2026, 3:40 p. m.');
  });

  it('shows an instant on the clock of whoever is looking', () => {
    expect(dates('Asia/Shanghai').instant('2026-10-17T21:40:00Z', 'moment')).toBe(
      '18 oct 2026, 5:40 a. m.',
    );
  });

  it("names the last day of a term where it ends at the viewer's midnight", () => {
    expect(dates('America/Costa_Rica').termEnd(TERM_END)).toBe('17 de noviembre de 2026');
    // Same offset as Costa Rica, so the same midnight.
    expect(dates('America/Guatemala').termEnd(TERM_END)).toBe('17 de noviembre de 2026');
  });

  it('names the local time a term ends anywhere else, since a day alone would be wrong', () => {
    expect(dates('America/Los_Angeles').termEnd(TERM_END)).toBe('17 nov 2026, 10:00 p. m.');
    expect(dates('Asia/Shanghai').termEnd(TERM_END)).toBe('18 nov 2026, 2:00 p. m.');
    expect(dates('UTC').termEnd(TERM_END)).toBe('18 nov 2026, 6:00 a. m.');
  });

  it('shows a calendar day as written, never the day before', () => {
    expect(dates().calendarDay('2026-11-17')).toBe('17 de noviembre de 2026');
    expect(dates().calendarDay('2027-01-01')).toBe('1 de enero de 2027');
  });

  it('refuses a value that is not a calendar day instead of guessing one', () => {
    expect(() => dates().calendarDay('2026-11-17T06:00:00Z')).toThrow(TypeError);
    expect(() => dates().calendarDay('17/11/2026')).toThrow(TypeError);
  });
});
