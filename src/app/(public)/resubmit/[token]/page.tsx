import { CorrectionForm } from '@/modules/members/components/CorrectionForm';

// The link a rejection or a request for changes carries, which is why this path
// belongs to the correction and not to the applicant's panel.
const Resubmit = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;

  return <CorrectionForm token={token} />;
};

export default Resubmit;
