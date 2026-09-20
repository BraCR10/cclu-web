import Link from 'next/link';
import { ArrowLeftIcon } from './icons';

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

// Screens reached from a link or a scanned code have no history worth trusting
// and, outside the public layout, no header to leave by. This is the way out.
export function BackLink({ href, label, className = '' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`flex w-fit items-center gap-2 text-sm font-medium text-content-muted transition-colors hover:text-content ${className}`}
    >
      <ArrowLeftIcon className="size-4" />
      {label}
    </Link>
  );
}
