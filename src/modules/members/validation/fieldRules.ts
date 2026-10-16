import type { RegistrationDraft } from '../api/registration';

export type FieldName =
  | keyof Omit<RegistrationDraft, 'consents' | 'passwordConfirmation'>
  | 'passwordConfirmation'
  | 'consentStatutes'
  | 'consentMarketplace'
  | 'consentPrivacy';

export type ProblemCode =
  | 'required'
  | 'not_allowed'
  | 'invalid_format'
  | 'too_long'
  | 'email'
  | 'mismatch'
  | 'consents'
  | 'password';

export type Problem = {
  field: FieldName;
  code: ProblemCode;
};

export type Rule = {
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
  code?: ProblemCode;
};

// The mirror of what src/config/memberRules.js enforces, so a person is told
// while they are still on the field rather than after they send anything. The
// API keeps the last word; this only saves the round trip. Every form in the
// module checks its fields with these, which is what keeps one form's rules from
// drifting away from another's.
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE = /^[0-9+\-() ]{8,20}$/;
export const DOCUMENT = /^[0-9A-Za-z-]{6,20}$/;
export const LINK = /^https?:\/\/[^\s<>]{4,300}$/i;
export const HANDLE = /^[^\s<>]{1,60}$/;

export function isCompany(memberType: RegistrationDraft['memberType']): boolean {
  return memberType === 'business' || memberType === 'association';
}

export function check(problems: Problem[], field: FieldName, value: string, rule: Rule) {
  const trimmed = value.trim();

  if (trimmed === '') {
    if (rule.required === true) {
      problems.push({ field, code: 'required' });
    }

    return;
  }

  if (rule.maxLength !== undefined && trimmed.length > rule.maxLength) {
    problems.push({ field, code: 'too_long' });
    return;
  }

  if (rule.pattern !== undefined && !rule.pattern.test(trimmed)) {
    problems.push({ field, code: rule.code ?? 'invalid_format' });
  }
}
