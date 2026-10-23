import { PublicationEditPage } from '@/modules/marketplace/components/PublicationEditPage';

const EditPublication = async ({ params }: { params: Promise<{ publicationId: string }> }) => {
  const { publicationId } = await params;

  return <PublicationEditPage publicationId={publicationId} />;
};

export default EditPublication;
