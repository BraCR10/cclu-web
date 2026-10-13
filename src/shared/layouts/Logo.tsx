import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = '/', className }: LogoProps) {
  const translate = useTranslations('common.shell');

  return (
    <Link
      href={href}
      aria-label={translate('logo')}
      className={classNames(
        'inline-flex shrink-0 rounded-sm focus-visible:shadow-focus focus-visible:outline-none',
        className,
      )}
    >
      <Image
        src="/brand/cclu-logo.png"
        alt=""
        width={378}
        height={123}
        priority
        className="h-full w-auto"
      />
    </Link>
  );
}
