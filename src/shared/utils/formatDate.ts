// A calendar day as the chamber reads it, whatever zone the browser is in.
const LONG_DATE = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'long',
  timeZone: 'America/Costa_Rica',
});

export function formatDate(value: string | Date): string {
  return LONG_DATE.format(new Date(value));
}
