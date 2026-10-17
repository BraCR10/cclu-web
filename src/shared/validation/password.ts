export const PASSWORD_MINIMUM_LENGTH = 10;
export const PASSWORD_MAXIMUM_BYTES = 72;

export type PasswordRuleId = 'length' | 'letter' | 'number' | 'symbol';

// The mirror of what src/config/memberRules.js enforces, kept in the same order
// so the list under the field can be read without counting. The prototype drew
// an uppercase-and-lowercase pair; the API asks for a letter, a number and a
// symbol instead, and the list has to say what is actually required.
const PATTERNS: Partial<Record<PasswordRuleId, RegExp>> = {
  letter: /\p{L}/u,
  number: /\p{Nd}/u,
  symbol: /[^\p{L}\p{Nd}]/u,
};

export const PASSWORD_RULE_IDS: PasswordRuleId[] = ['length', 'letter', 'number', 'symbol'];

export function passwordByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isRuleMet(rule: PasswordRuleId, value: string): boolean {
  const pattern = PATTERNS[rule];

  return pattern === undefined ? value.length >= PASSWORD_MINIMUM_LENGTH : pattern.test(value);
}

export function unmetPasswordRules(value: string): PasswordRuleId[] {
  return PASSWORD_RULE_IDS.filter((rule) => !isRuleMet(rule, value));
}

export function isPasswordAcceptable(value: string): boolean {
  return (
    value !== '' &&
    passwordByteLength(value) <= PASSWORD_MAXIMUM_BYTES &&
    unmetPasswordRules(value).length === 0
  );
}
