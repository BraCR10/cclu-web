import { classNames } from '@/shared/utils/classNames';

export type AvatarSize = 's' | 'm' | 'l';

const SIZE_CLASSES: Record<AvatarSize, { box: string; text: string }> = {
  s: { box: 'size-8 rounded-sm', text: 'text-label-s' },
  m: { box: 'size-12 rounded-md', text: 'font-display text-heading-s' },
  l: { box: 'size-18 rounded-lg', text: 'font-display text-heading-l' },
};

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase('es'))
    .join('');
}

type AvatarProps = {
  name: string;
  src?: string;
  size?: AvatarSize;
};

export function Avatar({ name, src, size = 'm' }: AvatarProps) {
  const classes = SIZE_CLASSES[size];

  if (src) {
    return (
      // A member's logo comes from storage at any size, so next/image's fixed
      // dimensions and remote host list would not fit it yet.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={classNames('shrink-0 border border-line-subtle object-cover', classes.box)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={classNames(
        'inline-flex shrink-0 items-center justify-center bg-brand-union-soft text-fg-brand',
        classes.box,
        classes.text,
      )}
    >
      <span aria-hidden>{initialsOf(name)}</span>
    </span>
  );
}
