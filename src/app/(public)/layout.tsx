import { PublicShell } from '@/shared/layouts/PublicShell';

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return <PublicShell>{children}</PublicShell>;
}
