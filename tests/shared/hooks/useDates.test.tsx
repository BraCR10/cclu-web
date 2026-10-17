import { describe, expect, it } from 'vitest';
import { useDates } from '@/shared/hooks/useDates';
import { renderHookWithIntl } from '../../support/renderWithIntl';

function dates() {
  return renderHookWithIntl(() => useDates()).result.current;
}

describe('useDates', () => {
  it('shows an instant on the Costa Rican calendar, whatever the UTC date is', () => {
    // 03:00 UTC on the 18th is 21:00 on the 17th in Costa Rica.
    expect(dates().instant('2026-11-18T03:00:00Z')).toBe('17 de noviembre de 2026');
  });

  it('shows a moment on the 12 hour clock Costa Rica reads', () => {
    expect(dates().instant('2026-10-17T21:40:00Z', 'moment')).toBe('17 oct 2026, 3:40 p. m.');
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
