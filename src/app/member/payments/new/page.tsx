import { RegisterPaymentPage } from '@/modules/plans/components/RegisterPaymentPage';

type SearchParams = Promise<{ plan?: string | string[]; resubmissionOf?: string | string[] }>;

// The plan and the rejected payment arrive in the address, from Mi membresía
// or from Mis pagos. Anything that is not a single value is ignored; the API
// checks both again.
const RegisterPayment = async ({ searchParams }: { searchParams: SearchParams }) => {
  const { plan, resubmissionOf } = await searchParams;

  return (
    <RegisterPaymentPage
      requestedPlan={typeof plan === 'string' ? plan : undefined}
      resubmissionOf={typeof resubmissionOf === 'string' ? resubmissionOf : null}
    />
  );
};

export default RegisterPayment;
