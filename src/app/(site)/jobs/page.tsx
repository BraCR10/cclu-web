import { JobList } from '@/modules/jobs/components/JobList';
import { findSection } from '@/shared/config/siteNavigation';

const SECTION = findSection('/jobs')!;

export const metadata = {
  title: `${SECTION.label} | Cámara de Comercio del Cantón de La Unión`,
};

export default function JobsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{SECTION.label}</h1>
        <p className="text-content-muted">{SECTION.summary}</p>
      </div>

      <JobList />
    </main>
  );
}
