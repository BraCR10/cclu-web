import { requestApi } from '@/shared/api/request';

export type RejectedRegistration = {
  email: string;
  businessName: string;
  businessDescription: string;
  phone: string;
  location: string;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  logoUrl: string | null;
  reason: string | null;
};

export type Corrections = {
  phone: string;
  location: string;
  businessName: string;
  businessDescription: string;
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
};

// The token in the address is the proof. Somebody whose registration was
// refused cannot sign in, so there is no session to send.
export function fetchRejectedRegistration(token: string): Promise<RejectedRegistration> {
  return requestApi<RejectedRegistration>(`/api/resubmission/${encodeURIComponent(token)}`);
}

export function resubmitRegistration(
  token: string,
  corrections: Corrections,
): Promise<{ id: string; applicationStatus: string }> {
  return requestApi(`/api/resubmission/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: JSON.stringify(corrections),
  });
}
