import type { IdentificationType, MemberType } from './api/applications';

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  business: 'Empresa',
  independent_professional: 'Profesional independiente',
};

export const IDENTIFICATION_TYPE_LABELS: Record<IdentificationType, string> = {
  national_id: 'Cédula',
  legal_entity_id: 'Cédula jurídica',
  passport: 'Pasaporte',
  dimex: 'DIMEX',
};
