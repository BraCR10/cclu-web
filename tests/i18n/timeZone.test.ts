import { describe, expect, it } from 'vitest';
import { CHAMBER_TIME_ZONE, isTimeZone, viewerTimeZone } from '@/i18n/timeZone';

describe('viewerTimeZone', () => {
  it('uses the zone the browser named', () => {
    expect(viewerTimeZone('Asia/Shanghai')).toBe('Asia/Shanghai');
    expect(viewerTimeZone('UTC')).toBe('UTC');
  });

  it('accepts the older names a browser may report for its own zone', () => {
    for (const zone of ['Asia/Calcutta', 'Europe/Kiev', 'Etc/UTC', 'Etc/GMT+5']) {
      expect(viewerTimeZone(zone)).toBe(zone);
    }
  });

  it('falls back to the chamber zone before the browser has named one', () => {
    expect(viewerTimeZone(undefined)).toBe(CHAMBER_TIME_ZONE);
  });

  it('never hands a value the runtime does not know to a formatter', () => {
    for (const value of ['', 'Mars/Olympus', '../../etc', '<script>', 'x'.repeat(65), 42]) {
      expect(isTimeZone(value)).toBe(false);
      expect(viewerTimeZone(value)).toBe(CHAMBER_TIME_ZONE);
    }
  });
});
