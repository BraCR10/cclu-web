import Image from 'next/image';

// The symbol travels alone and the name is typeset beside it. The full lockup
// carries its own dark blue wordmark, which disappears on a dark surface.
const SYMBOL = {
  source: '/logo-cclu-symbol.png',
  width: 315,
  height: 282,
};

const SIZES = {
  sm: { symbol: 'h-9 w-auto', line: 'text-xs', name: 'text-base' },
  md: { symbol: 'h-14 w-auto', line: 'text-sm', name: 'text-2xl' },
  lg: { symbol: 'h-20 w-auto', line: 'text-sm', name: 'text-4xl' },
};

type BrandMarkProps = {
  size?: keyof typeof SIZES;
  className?: string;
  // Drops the full legal name, which needs a width a navigation rail does not
  // have. The symbol and the cantón still identify the chamber.
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
        {!compact && (
          <span className={`${scale.line} font-medium tracking-wide uppercase opacity-80`}>
            Cámara de Comercio, Turismo, Industria y Afines
          </span>
        )}
        <span className={`${scale.name} font-semibold tracking-tight`}>
          {compact ? 'CCLU' : 'Cantón de La Unión'}
        </span>
        {compact && (
          <span className="text-xs font-medium text-content-muted">Cantón de La Unión</span>
        )}
      </span>
    </div>
  );
}
