import { describe, expect, it } from 'vitest';
import type { ShopDayHours } from '@/modules/marketplace/api/directory';
import { groupWeek, hasHours } from '@/modules/marketplace/weekHours';

const open = (day: ShopDayHours['day'], opensAt = '07:00', closesAt = '18:00'): ShopDayHours => ({
  day,
  closed: false,
  opensAt,
  closesAt,
});
const closed = (day: ShopDayHours['day']): ShopDayHours => ({ day, closed: true });

describe('groupWeek', () => {
  it('joins neighbouring days that keep the same hours', () => {
    const week = [
      open('monday'),
      open('tuesday'),
      open('wednesday'),
      open('thursday'),
      open('friday'),
      open('saturday', '08:00', '19:00'),
      closed('sunday'),
    ];

    expect(groupWeek(week)).toEqual([
      { from: 'monday', to: 'friday', hours: { opensAt: '07:00', closesAt: '18:00' } },
      { from: 'saturday', to: 'saturday', hours: { opensAt: '08:00', closesAt: '19:00' } },
      { from: 'sunday', to: 'sunday', hours: null },
    ]);
  });

  it('keeps a run apart once a day breaks it', () => {
    const week = [open('monday'), closed('tuesday'), open('wednesday')];

    expect(groupWeek(week).map((group) => [group.from, group.to])).toEqual([
      ['monday', 'monday'],
      ['tuesday', 'tuesday'],
      ['wednesday', 'wednesday'],
    ]);
  });
});

describe('hasHours', () => {
  it('reads a week closed every day as hours never set', () => {
    expect(hasHours([closed('monday'), closed('tuesday')])).toBe(false);
    expect(hasHours([closed('monday'), open('tuesday')])).toBe(true);
  });
});
