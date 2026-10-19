const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export type TermProgress = {
  daysLeft: number;
  // From 0 when the term starts to 1 when it ends.
  elapsed: number;
};

// How much of a paid term is left. The end is the exclusive instant the API
// sends, so a term ending later today still counts that day.
export function termProgress(
  startedAt: string | null,
  expiresAt: string | null,
  now: Date,
): TermProgress | null {
  if (startedAt === null || expiresAt === null) {
    return null;
  }

  const start = Date.parse(startedAt);
  const end = Date.parse(expiresAt);
  const remaining = Math.max(0, end - now.getTime());
  const length = end - start;

  return {
    daysLeft: Math.ceil(remaining / DAY_IN_MILLISECONDS),
    elapsed: length <= 0 ? 1 : Math.min(1, Math.max(0, (now.getTime() - start) / length)),
  };
}
