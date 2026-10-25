import { AdminInvitationForm } from '@/modules/auth/components/AdminInvitationForm';

// The link the API mails carries the token in the path, and it lives outside
// /admin on purpose: the panel's layout turns away anybody without a session,
// and the person holding this link has no account yet.
async function AdminInvitation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <AdminInvitationForm token={token} />;
}

export default AdminInvitation;
