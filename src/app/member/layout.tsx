import { MemberShell } from '@/shared/layouts/MemberShell';

export default function MemberLayout({ children }: LayoutProps<'/member'>) {
  return <MemberShell>{children}</MemberShell>;
}
