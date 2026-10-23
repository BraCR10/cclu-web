import { PublicationPage } from '@/modules/marketplace/components/PublicationPage';

const Publication = async ({ params }: { params: Promise<{ publicationId: string }> }) => {
  const { publicationId } = await params;

  return <PublicationPage publicationId={publicationId} />;
};

export default Publication;
