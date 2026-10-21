import { describe, expect, it } from 'vitest';
import { greetingFor, percentOf } from '@/modules/admin/greeting';

describe('greetingFor', () => {
  it('greets by the hour on the viewer’s clock', () => {
    expect(greetingFor(8)).toBe('morning');
    expect(greetingFor(12)).toBe('afternoon');
    expect(greetingFor(18)).toBe('afternoon');
    expect(greetingFor(19)).toBe('evening');
  });
});

describe('percentOf', () => {
  it('rounds a share of the whole and answers nothing for an empty whole', () => {
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(0, 0)).toBe(0);
  });
});
