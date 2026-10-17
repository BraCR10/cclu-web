// Written by hand rather than through Intl: the Spanish locales leave a four
// digit amount ungrouped, and the prototype always shows ₡5.000.
export function formatColones(amount: number): string {
  const grouped = Math.trunc(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `₡${grouped}`;
}
