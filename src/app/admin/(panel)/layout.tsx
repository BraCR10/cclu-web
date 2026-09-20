import type { ReactNode } from 'react';
import { AdminPanelShell } from '@/modules/admin/components/AdminPanelShell';

// A layout, so the rail, the header and the bell are mounted once and survive
// every move between screens. Rendered inside each page, they were torn down
// and rebuilt on every click, which asked the API who you were each time.
//
// The group keeps the sign-in page out: it lives at /admin/login and has no
// session to build a panel around.
export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminPanelShell>{children}</AdminPanelShell>;
}
