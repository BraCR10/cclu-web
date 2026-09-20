// Mirrors src/config/memberRules.js in the API, field for field. The two
// repositories cannot share code, so this is kept in step by hand and the
// server remains the check that decides. What this buys is telling a person
// before they send anything.

// Each of these is explained to a person by PATTERN_REQUIREMENTS in
// messages.ts. A pattern added here without a sentence there is a test failure,
// which is what keeps a field from silently refusing without saying why.
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-() ]{8,20}$/,
  identificationNumber: /^[0-9A-Za-z-]{6,20}$/,
  handle: /^[^\s<>]{1,60}$/,
  link: /^https?:\/\/[^\s<>]{4,300}$/i,
} as const;

export type PatternName = keyof typeof PATTERNS;

export const FIELDS: Record<string, { maxLength: number; pattern?: PatternName }> = {
  email: { maxLength: 254, pattern: 'email' },
  phone: { maxLength: 20, pattern: 'phone' },
  whatsappNumber: { maxLength: 20, pattern: 'phone' },
  identificationNumber: { maxLength: 20, pattern: 'identificationNumber' },
  location: { maxLength: 200 },
  businessName: { maxLength: 120 },
  businessDescription: { maxLength: 500 },
  instagram: { maxLength: 60, pattern: 'handle' },
  facebook: { maxLength: 60, pattern: 'handle' },
  linkedin: { maxLength: 60, pattern: 'handle' },
  website: { maxLength: 300, pattern: 'link' },
  logoUrl: { maxLength: 300, pattern: 'link' },
};

export const PASSWORD = {
  minimumLength: 8,
  requirements: [
    { code: 'password_needs_letter', pattern: /\p{L}/u },
    { code: 'password_needs_digit', pattern: /\p{Nd}/u },
    { code: 'password_needs_special', pattern: /[^\p{L}\p{Nd}]/u },
  ],
} as const;

// Answers the code the API would answer, so the person reads the same sentence
// whether the form caught it or the server did.
export function checkField(
  field: string,
  rawValue: string,
  { required }: { required: boolean },
): string | null {
  const value = rawValue.trim();

  if (value === '') {
    return required ? 'required' : null;
  }

  const rule = FIELDS[field];

  if (rule === undefined) {
    return null;
  }

  if (value.length > rule.maxLength) {
    return 'too_long';
  }

  if (rule.pattern !== undefined && !PATTERNS[rule.pattern].test(value)) {
    return 'invalid_format';
  }

  return null;
}

export function checkPassword(password: string): string | null {
  if (password.length < PASSWORD.minimumLength) {
    return 'password_too_short';
  }

  for (const requirement of PASSWORD.requirements) {
    if (!requirement.pattern.test(password)) {
      return requirement.code;
    }
  }

  return null;
}
