import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';

// The link the API mails carries the token in the path, so this route is the
// one address a reset message can always reach.
async function ResetPassword({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <ResetPasswordForm token={token} />;
}

export default ResetPassword;
