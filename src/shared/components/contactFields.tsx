import type { ReactNode } from 'react';
import { FacebookIcon, GlobeIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon } from './icons';

// The map holds what to draw rather than what to draw with: returning the
// element keeps a component from being pulled out of a lookup mid-render.
const CONTACT_ICONS: Record<string, (className: string) => ReactNode> = {
  whatsappNumber: (className) => <WhatsAppIcon className={className} />,
  instagram: (className) => <InstagramIcon className={className} />,
  facebook: (className) => <FacebookIcon className={className} />,
  linkedin: (className) => <LinkedInIcon className={className} />,
  website: (className) => <GlobeIcon className={className} />,
  logoUrl: (className) => <GlobeIcon className={className} />,
};

// One place, so a field wears the same mark in the registration form, in the
// profile, in the administrator's inbox and in the public listing.
export function contactIcon(field: string, className = 'size-4'): ReactNode {
  return CONTACT_ICONS[field]?.(className) ?? null;
}

export function hasContactIcon(field: string): boolean {
  return field in CONTACT_ICONS;
}

// The mark sits inside the control rather than beside the label, so it is still
// there once somebody starts typing and the label has done its job.
export function WithContactIcon({ field, children }: { field: string; children: ReactNode }) {
  if (!hasContactIcon(field)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-content-muted">
        {contactIcon(field)}
      </span>
      {children}
    </div>
  );
}

// Only a control that actually carries a mark needs room for it. Applied to
// every field, the indent appears where there is nothing to indent around.
export function contactPadding(field: string): string {
  return hasContactIcon(field) ? 'pl-9' : '';
}
