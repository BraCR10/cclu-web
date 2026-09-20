// Mirrors the roles the API issues. The two repositories cannot share code, so
// this list has to be kept in step with the one the API signs into a session.
export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export type Identity = {
  id: string;
  role: Role;
};

// What the API answers about the signed in person. The session cookie carries
// only the identifier and the role, so the rest is read back from the account.
export type Account = Identity & {
  email: string;
  displayName: string;
  memberCode?: string | null;
  state?: string;
};
