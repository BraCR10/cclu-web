import Link from 'next/link';
import { CONTRACT_TYPE_LABELS } from '../jobsRules';
import type { Job } from '../api/jobs';

type JobCardProps = { job: Job };

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex flex-col gap-2 rounded-panel border border-border bg-surface-raised p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight">{job.title}</h3>
        <span className="shrink-0 rounded-pill bg-surface px-2.5 py-0.5 text-xs font-medium text-content-muted">
          {CONTRACT_TYPE_LABELS[job.contractType]}
        </span>
      </div>

      {job.business !== null && (
        <p className="text-sm text-content-muted">{job.business.businessName}</p>
      )}

      <p className="line-clamp-2 text-sm text-content-muted">{job.description}</p>

      {job.location !== null && <p className="text-xs text-content-muted">{job.location}</p>}
    </Link>
  );
}
