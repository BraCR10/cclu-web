// What every publication carries about the business behind it, per the ERS:
// enough to contact the commerce without opening its full public profile.
export type PublicationBusiness = {
  businessName: string;
  memberCode: string;
  email: string;
  phone: string;
  location: string;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  canton: string | null;
  sector: string | null;
};
