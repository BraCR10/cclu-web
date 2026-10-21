import { VacancyDetailPage } from '@/modules/jobs/components/VacancyDetailPage';

async function Vacancy({ params }: { params: Promise<{ vacancyId: string }> }) {
  const { vacancyId } = await params;

  return <VacancyDetailPage vacancyId={vacancyId} />;
}

export default Vacancy;
