import { DirectoryPage } from '@/modules/marketplace/components/DirectoryPage';

export default async function Directory({ searchParams }: PageProps<'/directory'>) {
  const { search } = await searchParams;

  return <DirectoryPage initialSearch={typeof search === 'string' ? search : ''} />;
}
