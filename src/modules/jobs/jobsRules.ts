// Mirrors src/config/... in the API: the same closed list, not a copy that can
// drift. The two repositories cannot share code, so this is kept in step by
// hand and the server remains the check that decides.
export const CONTRACT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  TEMPORARY: 'temporary',
  INTERNSHIP: 'internship',
} as const;

export type ContractType = (typeof CONTRACT_TYPES)[keyof typeof CONTRACT_TYPES];

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  [CONTRACT_TYPES.FULL_TIME]: 'Tiempo completo',
  [CONTRACT_TYPES.PART_TIME]: 'Medio tiempo',
  [CONTRACT_TYPES.TEMPORARY]: 'Temporal',
  [CONTRACT_TYPES.INTERNSHIP]: 'Pasantía',
};
