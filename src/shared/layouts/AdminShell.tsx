'use client';

import type { ReactNode } from 'react';
import { PanelShell } from './PanelShell';
import { adminNavigation } from './adminNavigation';

export function AdminShell({ children }: { children: ReactNode }) {
  return <PanelShell navigation={adminNavigation}>{children}</PanelShell>;
}
