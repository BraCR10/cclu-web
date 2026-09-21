import type { PublicationBusiness } from '@/modules/marketplace/api/business';

export function business(overrides: Partial<PublicationBusiness> = {}): PublicationBusiness {
  return {
    businessName: 'Panadería Tres Ríos',
    memberCode: 'MA7K2Q4',
    email: 'socio@example.cr',
    phone: '22791234',
    location: 'Frente al parque',
    whatsappNumber: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    website: null,
    canton: 'La Unión',
    sector: 'Comercio',
    ...overrides,
  };
}
