import type { HTMLAttributes } from 'react';
import { classNames } from '@/shared/utils/classNames';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article' | 'aside';
};

export function Card({ as: Element = 'div', className, ...rest }: CardProps) {
  return (
    <Element
      className={classNames(
        'rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6',
        className,
      )}
      {...rest}
    />
  );
}
