'use client';

import type { ReactNode } from 'react';
import { CredentialsForm } from '@/shared/components/CredentialsForm';
import { signInMember } from '../api/memberSession';

type MemberLoginFormProps = {
  onSignedIn: () => void;
  signIn?: (credentials: { email: string; password: string }) => Promise<void>;
  footer?: ReactNode;
};

// A member may be told their application is pending or was rejected, but only
// once the password was right. The API decides that; the reason it sends back
// is read straight from the shared message table.
export function MemberLoginForm({
  onSignedIn,
  signIn = signInMember,
  footer,
}: MemberLoginFormProps) {
  return <CredentialsForm onSignedIn={onSignedIn} signIn={signIn} footer={footer} />;
}
