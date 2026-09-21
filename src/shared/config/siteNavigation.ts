// What the platform is made of, and how much of each part actually exists. The
// status decides which sections get a screen explaining what is still missing;
// it is never printed as a label, because the screen itself says it in words.
export const SECTION_STATUS = {
  AVAILABLE: 'available',
  PARTIAL: 'partial',
  PLANNED: 'planned',
} as const;

export type SectionStatus = (typeof SECTION_STATUS)[keyof typeof SECTION_STATUS];

export type SiteSection = {
  href: string;
  label: string;
  summary: string;
  status: SectionStatus;
  // What the section will offer once it is finished. Shown on its own screen so
  // a visitor knows what is coming rather than only that something is missing.
  coming?: string[];
};

export const SITE_SECTIONS: readonly SiteSection[] = [
  {
    href: '/directory',
    label: 'Directorio',
    summary: 'Los comercios y profesionales afiliados a la Cámara.',
    status: SECTION_STATUS.AVAILABLE,
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    summary: 'Productos, servicios, promociones y descuentos entre afiliados.',
    status: SECTION_STATUS.AVAILABLE,
  },
  {
    href: '/jobs',
    label: 'Bolsa de empleo',
    summary: 'Vacantes publicadas por los comercios del cantón.',
    status: SECTION_STATUS.AVAILABLE,
  },
];

export const HOME_SECTION = { href: '/', label: 'Inicio' };

// The two ways in and the way to ask for one. Grouped because a visitor who
// does not yet know which they are should see all three at once.
export const SIGN_IN_ENTRIES = [
  { href: '/login', label: 'Soy agremiado' },
  { href: '/admin/login', label: 'Soy administrador' },
] as const;

// The only entry that needs explaining. The other two say what they are; this
// one is the answer for somebody who has no account to sign in with at all.
export const JOIN_ENTRY = {
  href: '/register',
  label: 'Solicitar afiliación',
  description: 'Envíe la solicitud de su comercio o actividad profesional.',
};

export function findSection(href: string): SiteSection | undefined {
  return SITE_SECTIONS.find((section) => section.href === href);
}
