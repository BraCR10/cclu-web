import { MemberDetailPage } from '@/modules/admin/components/MemberDetailPage';

export default async function AdminMember({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;

  return <MemberDetailPage memberId={memberId} />;
}
