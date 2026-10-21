import { EmailChangeConfirmation } from '@/modules/members/components/EmailChangeConfirmation';

const ConfirmEmail = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;

  return (
    <div className="mx-auto w-full max-w-xl py-8 lg:py-12">
      <EmailChangeConfirmation token={token} />
    </div>
  );
};

export default ConfirmEmail;
