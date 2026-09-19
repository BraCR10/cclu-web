// Grouped only for reading aloud. The stored value has no separators, so the
// grouping is added here and never sent back.
export function formatMemberCode(code: string): string {
  if (!/^[0-9A-Z]{7}$/.test(code)) {
    return code;
  }

  return `${code.slice(0, 1)}-${code.slice(1, 5)}-${code.slice(5)}`;
}
