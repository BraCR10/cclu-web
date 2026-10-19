import { EmailChangeConfirmation } from '@/modules/members/components/EmailChangeConfirmation';

const ConfirmEmail = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;

  return <EmailChangeConfirmation token={token} />;
};

export default ConfirmEmail;
