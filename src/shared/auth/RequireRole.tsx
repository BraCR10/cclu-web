import type { ReactNode } from 'react';
import type { Role } from './roles';
import type { Session } from './useSession';

type RequireRoleProps = {
  session: Session;
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

// This hides, it does not protect. Anyone can call the API directly, so the
// answer to who may do what is the server's and only the server's. What this
// buys is a person not being shown a door that will not open for them.
export function RequireRole({ session, allow, children, fallback = null }: RequireRoleProps) {
  if (session.status !== 'authenticated') {
    return <>{fallback}</>;
  }

  return <>{allow.includes(session.identity.role) ? children : fallback}</>;
}
