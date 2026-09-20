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
    status: SECTION_STATUS.PARTIAL,
    coming: [
      'Búsqueda por nombre, cantón y sector.',
      'Listado completo de comercios y profesionales afiliados.',
      'Filtros por tipo de afiliación.',
    ],
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    summary: 'Productos, servicios, promociones y descuentos entre afiliados.',
    status: SECTION_STATUS.PLANNED,
    coming: [
      'Publicación de productos y servicios por parte de los afiliados.',
      'Promociones y descuentos entre comercios de la Cámara.',
      'Contacto directo con el comercio que publica.',
    ],
  },
  {
    href: '/jobs',
    label: 'Bolsa de empleo',
    summary: 'Vacantes publicadas por los comercios del cantón.',
    status: SECTION_STATUS.PLANNED,
    coming: [
      'Publicación de vacantes por parte de los comercios afiliados.',
      'Búsqueda de vacantes por sector y jornada.',
      'Postulación desde la misma plataforma.',
    ],
  },
];

export const HOME_SECTION = { href: '/', label: 'Inicio' };

// The two ways in and the way to ask for one. Grouped because a visitor who
// does not yet know which they are should see all three at once.
export const SIGN_IN_ENTRIES = [
  { href: '/login', label: 'Soy agremiado' },
  { href: '/admin/login', label: 'Soy administrador' },
] as const;

export const JOIN_ENTRY = { href: '/register', label: 'Solicitar afiliación' };

export function findSection(href: string): SiteSection | undefined {
  return SITE_SECTIONS.find((section) => section.href === href);
}
