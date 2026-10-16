'use client';

import type { ReactNode } from 'react';
import { useCurrentViewer } from '@/shared/hooks/useCurrentViewer';
import { PanelShell } from './PanelShell';
import { adminNavigation } from './adminNavigation';

export function AdminShell({ children }: { children: ReactNode }) {
  const viewer = useCurrentViewer();

  return (
    <PanelShell navigation={adminNavigation} viewer={viewer}>
      {children}
    </PanelShell>
  );
}
