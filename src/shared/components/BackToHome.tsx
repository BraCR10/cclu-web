import Link from 'next/link';
import { ArrowLeftIcon } from './icons';

// The sign in screens sit outside the public layout, so they carry no header to
// leave by. Somebody who opened one by mistake, or who came to sign in and
// changed their mind, needs a way out that is not the browser's back button.
export function BackToHome({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex w-fit items-center gap-2 text-sm font-medium text-content-muted transition-colors hover:text-content ${className}`}
    >
      <ArrowLeftIcon className="size-4" />
      Volver al inicio
    </Link>
  );
}
