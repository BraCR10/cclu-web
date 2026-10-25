import { ApplicationDetailPage } from '@/modules/admin/components/ApplicationDetailPage';

export default async function AdminApplication({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <ApplicationDetailPage memberId={memberId} />;
}
