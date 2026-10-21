export type Greeting = 'morning' | 'afternoon' | 'evening';

const AFTERNOON_FROM = 12;
const EVENING_FROM = 19;

// By the hour on the viewer's own clock, since a greeting is said to them.
export function greetingFor(hour: number): Greeting {
  if (hour < AFTERNOON_FROM) {
    return 'morning';
  }

  return hour < EVENING_FROM ? 'afternoon' : 'evening';
}

// A share of a whole, rounded, and nothing rather than a division by zero.
export function percentOf(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}
