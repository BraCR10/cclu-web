'use client';

import type { ReactNode } from 'react';
import { CredentialsForm } from '@/shared/components/CredentialsForm';
import { signInAdmin } from '../api/adminSession';

type AdminLoginFormProps = {
  onSignedIn: () => void;
  signIn?: (credentials: { email: string; password: string }) => Promise<void>;
  footer?: ReactNode;
};

// An administrator is told nothing beyond the credentials being wrong. The
// panel is not a place whose membership the chamber discusses with strangers.
export function AdminLoginForm({ onSignedIn, signIn = signInAdmin, footer }: AdminLoginFormProps) {
  return <CredentialsForm onSignedIn={onSignedIn} signIn={signIn} footer={footer} />;
}
