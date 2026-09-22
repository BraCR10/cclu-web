import { contactIcon } from '@/shared/components/contactFields';
import { GlobeIcon } from '@/shared/components/icons';
import type { PublicationBusiness } from '../api/business';

type BusinessContactProps = {
  business: PublicationBusiness;
};

// What the ERS asks to show beside every publication: the commerce's name,
// email, phone, location and whichever social handles it registered.
export function BusinessContact({ business }: BusinessContactProps) {
  const handles = [
    { field: 'whatsappNumber', label: 'WhatsApp', value: business.whatsappNumber },
    { field: 'instagram', label: 'Instagram', value: business.instagram },
    { field: 'facebook', label: 'Facebook', value: business.facebook },
    { field: 'linkedin', label: 'LinkedIn', value: business.linkedin },
  ].filter((handle) => handle.value !== null && handle.value !== '');

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{business.businessName}</span>
        <span className="text-content-muted">{business.email}</span>
        <span className="text-content-muted">{business.phone}</span>
        <span className="text-content-muted">
          {business.location}
          {business.canton === null ? '' : ` · ${business.canton}`}
        </span>
      </div>

      {(business.website !== null || handles.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {business.website !== null && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-pill border border-brand px-3 py-1 text-xs font-medium text-brand"
            >
              <GlobeIcon className="size-3.5" />
              Sitio web
            </a>
          )}

          {/* Stored as free text, so they may be a handle rather than an
              address and must not be turned into one. */}
          {handles.map((handle) => (
            <span
              key={handle.field}
              title={handle.label}
              className="flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-1 text-xs"
            >
              <span className="text-content-muted">{contactIcon(handle.field)}</span>
              {handle.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
