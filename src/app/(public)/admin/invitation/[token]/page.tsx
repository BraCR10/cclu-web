import { AdminInvitationPage } from '@/modules/admin/components/AdminInvitationPage';

// The invited person has no account yet, so this sits outside the panel.
export default async function AdminInvitation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <AdminInvitationPage token={token} />;
}
