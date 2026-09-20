// What a member is and how they are identified. Both modules need this: the
// registration form offers it, the administrator's inbox reads it back and the
// directory prints it. It lived in modules/admin and modules/members at once,
// declared twice with the same values, which is the drift waiting to happen
// that the architecture document's module rule exists to prevent.
export const MEMBER_TYPES = {
  BUSINESS: 'business',
  INDEPENDENT_PROFESSIONAL: 'independent_professional',
} as const;

export const IDENTIFICATION_TYPES = {
  NATIONAL_ID: 'national_id',
  LEGAL_ENTITY_ID: 'legal_entity_id',
  PASSPORT: 'passport',
  DIMEX: 'dimex',
} as const;

export type MemberType = (typeof MEMBER_TYPES)[keyof typeof MEMBER_TYPES];
export type IdentificationType = (typeof IDENTIFICATION_TYPES)[keyof typeof IDENTIFICATION_TYPES];

// The values are what the API stores; these are what a person reads. Kept
// beside them so a value added above without a label here is a type error.
export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  [MEMBER_TYPES.BUSINESS]: 'Empresa',
  [MEMBER_TYPES.INDEPENDENT_PROFESSIONAL]: 'Profesional independiente',
};

export const IDENTIFICATION_TYPE_LABELS: Record<IdentificationType, string> = {
  [IDENTIFICATION_TYPES.NATIONAL_ID]: 'Cédula',
  [IDENTIFICATION_TYPES.LEGAL_ENTITY_ID]: 'Cédula jurídica',
  [IDENTIFICATION_TYPES.PASSPORT]: 'Pasaporte',
  [IDENTIFICATION_TYPES.DIMEX]: 'DIMEX',
};
