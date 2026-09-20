import type { ReactNode } from 'react';
import { MemberPanelShell } from '@/modules/members/components/MemberPanelShell';

// A layout, so the rail, the header and the profile are mounted once and
// survive every move between screens. Rendered inside each page, they were torn
// down and rebuilt on every click, which asked the API who you were each time.
export default function MemberPanelLayout({ children }: { children: ReactNode }) {
  return <MemberPanelShell>{children}</MemberPanelShell>;
}
