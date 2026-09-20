import Image from 'next/image';

// The symbol travels alone and the name is typeset beside it. The full lockup
// carries its own dark blue wordmark, which disappears on a dark surface.
const SYMBOL = {
  source: '/logo-cclu-symbol.png',
  width: 315,
  height: 282,
};

const SIZES = {
  // For a bar that also has to hold navigation. The descriptor is forty six
  // characters, so its width is what decides whether the row fits.
  xs: { symbol: 'h-8 w-auto', line: 'text-[0.625rem]', name: 'text-sm' },
  sm: { symbol: 'h-9 w-auto', line: 'text-xs', name: 'text-base' },
  md: { symbol: 'h-14 w-auto', line: 'text-sm', name: 'text-2xl' },
  lg: { symbol: 'h-20 w-auto', line: 'text-sm', name: 'text-4xl' },
};

const DESCRIPTOR = 'Cámara de Comercio, Turismo, Industria y Afines';
const NAME = 'Cantón de La Unión';

type BrandMarkProps = {
  size?: keyof typeof SIZES;
  className?: string;
  // Drops the descriptor, which needs a width a navigation rail does not have.
  // The chamber is still named: the cantón is what identifies it.
  compact?: boolean;
};

export function BrandMark({ size = 'md', className = '', compact = false }: BrandMarkProps) {
  const scale = SIZES[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src={SYMBOL.source}
        alt=""
        width={SYMBOL.width}
        height={SYMBOL.height}
        priority
        className={scale.symbol}
      />
      <span className="flex flex-col leading-tight">
        {/* Forty six characters do not fit beside a telephone's navigation, so
            the descriptor steps aside there and the name carries the mark. */}
        {!compact && (
          <span
            className={`${scale.line} hidden font-medium tracking-wide uppercase opacity-80 sm:block`}
          >
            {DESCRIPTOR}
          </span>
        )}
        <span className={`${scale.name} font-semibold tracking-tight`}>{NAME}</span>
      </span>
    </div>
  );
}
