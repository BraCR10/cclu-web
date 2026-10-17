import { describe, expect, it } from 'vitest';
import { formatColones } from '@/shared/utils/formatColones';

describe('formatColones', () => {
  it('groups thousands with a dot, four digits included', () => {
    expect(formatColones(0)).toBe('₡0');
    expect(formatColones(5000)).toBe('₡5.000');
    expect(formatColones(20000)).toBe('₡20.000');
    expect(formatColones(1000000)).toBe('₡1.000.000');
  });
});
