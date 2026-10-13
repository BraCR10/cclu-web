import { AdminShell } from '@/shared/layouts/AdminShell';

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return <AdminShell>{children}</AdminShell>;
}
