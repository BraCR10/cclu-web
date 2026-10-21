// Where a member's public profile lives. The card's QR and its copy button both
// point here, so the path is written once.
export function publicProfilePath(memberCode: string): string {
  return `/directory/${encodeURIComponent(memberCode)}`;
}
