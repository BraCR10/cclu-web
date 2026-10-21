import type { ShopDay, ShopDayHours } from './api/directory';

export type HoursGroup = {
  from: ShopDay;
  to: ShopDay;
  hours: { opensAt: string; closesAt: string } | null;
};

function hoursOf(day: ShopDayHours) {
  return day.closed || day.opensAt === null || day.closesAt === null
    ? null
    : { opensAt: day.opensAt, closesAt: day.closesAt };
}

function sameHours(left: HoursGroup['hours'], right: HoursGroup['hours']) {
  return left?.opensAt === right?.opensAt && left?.closesAt === right?.closesAt;
}

// A shop reads its week as runs of days: "Lunes a viernes, 7:00 a. m. a 6:00
// p. m." rather than the same hours written five times. Only neighbouring days
// join, so a week that closes on Wednesday reads as two runs.
export function groupWeek(week: ShopDayHours[]): HoursGroup[] {
  const groups: HoursGroup[] = [];

  for (const day of week) {
    const hours = hoursOf(day);
    const last = groups.at(-1);

    if (last !== undefined && sameHours(last.hours, hours)) {
      last.to = day.day;
    } else {
      groups.push({ from: day.day, to: day.day, hours });
    }
  }

  return groups;
}

// Whether the member ever set their hours. A week closed every day is what the
// API answers before that, and is better left unsaid than shown as closed.
export function hasHours(week: ShopDayHours[]): boolean {
  return week.some((day) => hoursOf(day) !== null);
}
