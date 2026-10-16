'use client';

import type { ReactNode } from 'react';
import { useCurrentViewer } from '@/shared/hooks/useCurrentViewer';
import { PanelShell } from './PanelShell';
import { memberNavigation } from './memberNavigation';

// Navigation lists carry icon components, which cannot cross from a server
// layout into a client component, so each panel binds its own list here.
export function MemberShell({ children }: { children: ReactNode }) {
  const viewer = useCurrentViewer();

  return (
    <PanelShell navigation={memberNavigation} viewer={viewer}>
      {children}
    </PanelShell>
  );
}
