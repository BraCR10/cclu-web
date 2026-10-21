import { PublicProfilePage } from '@/modules/marketplace/components/PublicProfilePage';

// The address a member card's QR carries, so it never changes.
async function PublicProfile({ params }: { params: Promise<{ memberCode: string }> }) {
  const { memberCode } = await params;

  return <PublicProfilePage memberCode={decodeURIComponent(memberCode)} />;
}

export default PublicProfile;
